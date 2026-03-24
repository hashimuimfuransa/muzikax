const { updateChartScores, getTimeWindowRange } = require('../services/chartService');
const DailyStats = require('../models/DailyStats');
const ChartScore = require('../models/ChartScore');
const PlayHistory = require('../models/PlayHistory');
const ListenerGeography = require('../models/ListenerGeography');
const redisCache = require('../utils/redisCache');
const { broadcastChartUpdate } = require('../utils/chartBroadcaster');

/**
 * Aggregate daily statistics from play history
 * Runs every hour to update yesterday's and today's stats
 */
async function aggregateDailyStats() {
  try {
    console.log('[Chart Aggregator] Starting daily stats aggregation...');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Aggregate stats for today (partial day)
    await aggregateStatsForDate(today);
    
    // Re-aggregate stats for yesterday (complete day)
    await aggregateStatsForDate(yesterday);
    
    console.log('[Chart Aggregator] Daily stats aggregation completed');
  } catch (error) {
    console.error('[Chart Aggregator] Error aggregating daily stats:', error);
  }
}

/**
 * Aggregate stats for a specific date
 * @param {Date} date - Date to aggregate
 */
async function aggregateStatsForDate(date) {
  try {
    // Check if database connection is ready
    const mongoose = require('mongoose');
    if (!mongoose.connection.readyState) {
      console.log('[Chart Aggregator] Database not connected, skipping aggregation');
      return;
    }
    
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    // Get all plays for this date
    const plays = await PlayHistory.find({
      timestamp: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).lean();
    
    if (plays.length === 0) {
      console.log(`[Chart Aggregator] No plays found for ${date.toDateString()}`);
      return;
    }
    
    // Group by track
    const trackMap = new Map();
    
    plays.forEach(play => {
      const trackId = play.trackId.toString();
      
      if (!trackMap.has(trackId)) {
        trackMap.set(trackId, {
          trackId,
          plays: 0,
          uniqueIPs: new Set(),
          uniqueUsers: new Set(),
          countries: new Map(),
          hourlyPlays: new Array(24).fill(0),
          suspiciousPlays: 0
        });
      }
      
      const trackData = trackMap.get(trackId);
      trackData.plays += 1;
      trackData.uniqueIPs.add(play.ipAddress);
      
      if (play.userId) {
        trackData.uniqueUsers.add(play.userId.toString());
      }
      
      // Country breakdown
      const geoData = ListenerGeography.findOne({ 
        ipAddress: play.ipAddress,
        timestamp: { $gte: startOfDay, $lt: endOfDay }
      });
      
      if (geoData) {
        const country = geoData.country || 'UNKNOWN';
        const countryData = trackData.countries.get(country);
        if (countryData) {
          countryData.plays += 1;
        } else {
          trackData.countries.set(country, { country, plays: 1, uniqueListeners: 1 });
        }
      }
      
      // Hourly breakdown
      const hour = new Date(play.timestamp).getHours();
      trackData.hourlyPlays[hour] += 1;
    });
    
    // Create or update DailyStats records
    const statsToSave = Array.from(trackMap.values()).map(data => ({
      trackId: data.trackId,
      date: startOfDay,
      plays: data.plays,
      uniqueListeners: Math.max(data.uniqueIPs.size, data.uniqueUsers.size),
      uniqueIPs: data.uniqueIPs.size,
      countries: Array.from(data.countries.values()),
      hourlyPlays: data.hourlyPlays.map((plays, hour) => ({ hour, plays })),
      suspiciousPlays: data.suspiciousPlays
    }));
    
    // Bulk upsert
    for (const stats of statsToSave) {
      await DailyStats.findOneAndUpdate(
        { trackId: stats.trackId, date: stats.date },
        stats,
        { upsert: true, new: true }
      );
    }
    
    console.log(`[Chart Aggregator] Aggregated ${statsToSave.length} tracks for ${date.toDateString()}`);
  } catch (error) {
    console.error('[Chart Aggregator] Error aggregating date:', error);
  }
}

/**
 * Update chart scores for all time windows
 * Runs every hour
 */
async function updateAllChartScores() {
  try {
    console.log('[Chart Aggregator] Updating chart scores...');
    
    // Update daily charts
    await updateChartScores('daily');
    
    // Update weekly charts
    await updateChartScores('weekly');
    
    // Update monthly charts
    await updateChartScores('monthly');
    
    console.log('[Chart Aggregator] Chart scores updated successfully');
  } catch (error) {
    console.error('[Chart Aggregator] Error updating chart scores:', error);
  }
}

/**
 * Clean up old data
 * Keep last 90 days of detailed stats, archive older data
 * Runs once per day at midnight
 */
async function cleanupOldData() {
  try {
    console.log('[Chart Aggregator] Cleaning up old data...');
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Delete old daily stats
    const deletedStats = await DailyStats.deleteMany({
      date: { $lt: ninetyDaysAgo }
    });
    
    // Delete old chart scores
    const deletedScores = await ChartScore.deleteMany({
      calculatedAt: { $lt: ninetyDaysAgo }
    });
    
    console.log(`[Chart Aggregator] Deleted ${deletedStats.deletedCount} old daily stats`);
    console.log(`[Chart Aggregator] Deleted ${deletedScores.deletedCount} old chart scores`);
  } catch (error) {
    console.error('[Chart Aggregator] Error cleaning up old data:', error);
  }
}

/**
 * Initialize cron jobs for chart aggregation
 */
function initChartAggregator() {
  console.log('[Chart Aggregator] Initializing...');
  
  // Run aggregation every hour
  setInterval(aggregateDailyStats, 60 * 60 * 1000); // Every hour
  
  // Update chart scores every hour (5 minutes after aggregation)
  setInterval(updateAllChartScores, 60 * 60 * 1000 + 5 * 60 * 1000); // Every hour + 5 min
  
  // Cleanup old data once per day at midnight
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = tomorrow - now;
  
  setTimeout(() => {
    cleanupOldData();
    // Then run every 24 hours
    setInterval(cleanupOldData, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  // Run initial aggregation immediately
  aggregateDailyStats();
  
  console.log('[Chart Aggregator] Initialized successfully');
}

// Export for manual triggering if needed
module.exports = {
  aggregateDailyStats,
  aggregateStatsForDate,
  updateAllChartScores,
  cleanupOldData,
  initChartAggregator
};
