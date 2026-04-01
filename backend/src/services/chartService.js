const ChartScore = require('../models/ChartScore');
const DailyStats = require('../models/DailyStats');
const Track = require('../models/Track');
const { calculateGrowthRate, calculateVelocity } = require('../utils/growthCalculator');

// Configurable weights for chart calculation
const CHART_WEIGHTS = {
  streams: 0.4,          // Total plays
  uniqueListeners: 0.2,  // Unique users
  likes: 0.15,           // Like engagements
  shares: 0.1,           // Social shares
  playlists: 0.1,        // Playlist additions
  growth: 0.05           // Velocity bonus
};

/**
 * Calculate chart score for a single track
 * @param {Object} track - Track object with stats
 * @param {Object} dailyStats - Daily statistics for the track
 * @returns {Object} Score breakdown
 */
function calculateTrackScore(track, dailyStats) {
  const totalPlays = track.plays || 0;
  const uniquePlays = track.uniquePlays || 0;
  const uniqueListeners = dailyStats?.uniqueListeners || 0;
  const likes = track.likes || 0;
  const shares = track.shares || 0;
  const playlistAdditions = track.playlistAdditions || 0;
  
  // Normalize metrics (log scale to prevent extreme outliers)
  const normalizedPlays = Math.log10(totalPlays + 1);
  const normalizedUniquePlays = Math.log10(uniquePlays + 1);
  const normalizedUnique = Math.log10(uniqueListeners + 1);
  const normalizedLikes = Math.log10(likes + 1);
  const normalizedShares = Math.log10(shares + 1);
  const normalizedPlaylists = Math.log10(playlistAdditions + 1);
  
  // Calculate growth velocity
  const velocity = dailyStats ? calculateVelocity(dailyStats) : 0;
  const normalizedVelocity = Math.log10(velocity + 1);
  
  // Apply weights - unique plays gets portion of streams weight
  const streamsScore = normalizedPlays * CHART_WEIGHTS.streams * 0.7 * 100;
  const uniquePlaysScore = normalizedUniquePlays * CHART_WEIGHTS.streams * 0.3 * 100;
  const uniqueScore = normalizedUnique * CHART_WEIGHTS.uniqueListeners * 100;
  const likesScore = normalizedLikes * CHART_WEIGHTS.likes * 100;
  const sharesScore = normalizedShares * CHART_WEIGHTS.shares * 100;
  const playlistsScore = normalizedPlaylists * CHART_WEIGHTS.playlists * 100;
  const growthScore = normalizedVelocity * CHART_WEIGHTS.growth * 100;
  
  const totalScore = streamsScore + uniquePlaysScore + uniqueScore + likesScore + sharesScore + playlistsScore + growthScore;
  
  return {
    totalScore,
    breakdown: {
      streamsScore,
      uniquePlaysScore,
      uniqueScore,
      likesScore,
      sharesScore,
      playlistsScore,
      growthScore
    },
    metrics: {
      totalPlays,
      uniquePlays,
      uniqueListeners,
      likes,
      shares,
      reposts: track.reposts || 0,
      playlistAdditions,
      velocity
    }
  };
}

/**
 * Get date range for time window
 * @param {string} timeWindow - 'daily', 'weekly', or 'monthly'
 * @returns {Object} Start and end dates
 */
function getTimeWindowRange(timeWindow) {
  const now = new Date();
  let startDate = new Date();
  
  switch (timeWindow) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7); // Default to weekly
  }
  
  return { startDate, endDate: now };
}

/**
 * Calculate scores for all tracks within a time window
 * @param {string} timeWindow - 'daily', 'weekly', or 'monthly'
 * @returns {Promise<Array>} Array of tracks with scores
 */
async function calculateScoresForTimeWindow(timeWindow = 'weekly') {
  try {
    const { startDate, endDate } = getTimeWindowRange(timeWindow);
    
    // Get all tracks with engagement data
    const tracks = await Track.find({
      isPublic: { $ne: false }
    })
    .populate('creatorId', 'name')
    .lean();
    
    // Get daily stats for the time period
    const dailyStatsList = await DailyStats.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).lean();
    
    // Create a map of trackId to aggregated stats
    const statsMap = {};
    dailyStatsList.forEach(stats => {
      const trackId = stats.trackId.toString();
      if (!statsMap[trackId]) {
        statsMap[trackId] = {
          plays: 0,
          uniqueListeners: 0,
          likes: 0,
          shares: 0,
          reposts: 0,
          playlistAdditions: 0,
          days: 0
        };
      }
      
      statsMap[trackId].plays += stats.plays || 0;
      statsMap[trackId].uniqueListeners += stats.uniqueListeners || 0;
      statsMap[trackId].likes += stats.likes || 0;
      statsMap[trackId].shares += stats.shares || 0;
      statsMap[trackId].reposts += stats.reposts || 0;
      statsMap[trackId].playlistAdditions += stats.playlistAdditions || 0;
      statsMap[trackId].days += 1;
    });
    
    // Calculate scores for each track
    const tracksWithScores = tracks.map(track => {
      const trackId = track._id.toString();
      const aggregatedStats = statsMap[trackId];
      
      // If no stats in this period, use overall track stats
      const statsToUse = aggregatedStats || {
        plays: track.plays,
        uniqueListeners: Math.floor(track.plays * 0.7), // Estimate
        likes: track.likes,
        shares: track.shares,
        reposts: track.reposts,
        playlistAdditions: track.playlistAdditions
      };
      
      const scoreData = calculateTrackScore(track, statsToUse);
      
      return {
        ...track,
        chartScore: scoreData.totalScore,
        scoreBreakdown: scoreData.breakdown,
        chartMetrics: scoreData.metrics,
        timeWindow
      };
    });
    
    // Sort by score descending
    tracksWithScores.sort((a, b) => b.chartScore - a.chartScore);
    
    // Assign ranks
    tracksWithScores.forEach((track, index) => {
      track.rank = index + 1;
      track.previousRank = Math.floor(Math.random() * 10); // Placeholder - will be updated with historical data
    });
    
    return tracksWithScores;
  } catch (error) {
    console.error('Error calculating scores:', error);
    throw error;
  }
}

/**
 * Update chart scores in database
 * @param {string} timeWindow - Time window to update
 * @returns {Promise<void>}
 */
async function updateChartScores(timeWindow = 'weekly') {
  try {
    const tracksWithScores = await calculateScoresForTimeWindow(timeWindow);
    
    // Bulk update chart scores
    const bulkOps = tracksWithScores.map(track => ({
      updateOne: {
        filter: { trackId: track._id },
        update: {
          $set: {
            [`${timeWindow}Score`]: track.chartScore,
            globalScore: track.chartScore,
            totalPlays: track.chartMetrics.totalPlays,
            uniquePlays: track.chartMetrics.uniquePlays,
            uniqueListeners: track.chartMetrics.uniqueListeners,
            likes: track.chartMetrics.likes,
            shares: track.chartMetrics.shares,
            reposts: track.metrics?.reposts || 0,
            playlistAdditions: track.chartMetrics.playlistAdditions,
            playVelocity: track.chartMetrics.velocity,
            growthRate: calculateGrowthRate(track),
            globalRank: track.rank,
            lastUpdated: new Date(),
            calculatedAt: new Date()
          }
        },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      await ChartScore.bulkWrite(bulkOps);
    }
    
    console.log(`Updated chart scores for ${tracksWithScores.length} tracks (${timeWindow})`);
  } catch (error) {
    console.error('Error updating chart scores:', error);
    throw error;
  }
}

/**
 * Get charts by country
 * @param {string} countryCode - Country code (e.g., 'RW', 'US')
 * @param {string} timeWindow - Time window
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Filtered charts
 */
async function getCountryCharts(countryCode, timeWindow = 'weekly', limit = 50) {
  try {
    console.log(`\n🌍 Getting country charts for: ${countryCode}`);
    console.log(`   Time window: ${timeWindow}, Limit: ${limit}`);
    
    const startTime = Date.now();
    
    // Use pre-calculated ChartScore data for better performance
    const sortField = `${timeWindow}Score`;
    
    // Get fresh chart data from the last 7 days (ensure recent data)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const chartData = await ChartScore.find({
      lastUpdated: { $gte: sevenDaysAgo }
    })
    .sort({ [sortField]: -1, lastUpdated: -1 })
    .limit(limit * 3) // Get more to filter by country
    .select('trackId dailyScore weeklyScore monthlyScore totalPlays uniqueListeners likes shares reposts playlistAdditions playVelocity growthRate globalRank lastUpdated')
    .lean();
    
    console.log(`   📊 Found ${chartData.length} ChartScore documents (filtered by lastUpdated)`);
    
    if (chartData.length === 0) {
      // Fallback to calculation if no chart scores exist
      console.log(`No ChartScore data found, calculating on-the-fly for ${countryCode}`);
      return await getCountryChartsFallback(countryCode, timeWindow, limit);
    }
    
    // Extract track IDs for batch query
    const trackIds = chartData.map(chart => chart.trackId);
    
    // BATCH QUERY: Get all ListenerGeography data in ONE query using aggregation
    const ListenerGeography = require('../models/ListenerGeography');
    const countryStatsAgg = await ListenerGeography.aggregate([
      {
        $match: {
          trackId: { $in: trackIds },
          country: countryCode.toUpperCase()
        }
      },
      {
        $group: {
          _id: '$trackId',
          plays: { $sum: 1 },
          uniqueListeners: { $addToSet: '$ipAddress' },
          uniqueUserIds: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          trackId: '$_id',
          plays: 1,
          uniqueListeners: { $size: '$uniqueListeners' },
          uniqueUserIds: { $size: '$uniqueUserIds' },
          _id: 0
        }
      }
    ]);
    
    console.log(`   📍 Batch query returned ${countryStatsAgg.length} tracks with listeners in ${countryCode}`);
    
    // Create a map for fast lookup
    const countryStatsMap = new Map();
    countryStatsAgg.forEach(stat => {
      countryStatsMap.set(stat.trackId.toString(), stat);
    });
    
    // Filter and format results
    const countryTracks = [];
    
    for (const chart of chartData) {
      const stats = countryStatsMap.get(chart.trackId.toString());
      
      if (stats && stats.plays > 0) {
        const countryScore = (stats.plays * 0.6) + (stats.uniqueListeners * 0.4);
        
        countryTracks.push({
          _id: chart.trackId,
          countryScore,
          countryPlays: stats.plays,
          countryUniqueListeners: Math.max(stats.uniqueListeners, stats.uniqueUserIds || 0),
          weeklyScore: chart.weeklyScore || 0,
          dailyScore: chart.dailyScore || 0,
          monthlyScore: chart.monthlyScore || 0,
          globalRank: chart.globalRank || 0,
          totalPlays: chart.totalPlays || 0,
          uniqueListeners: chart.uniqueListeners || 0,
          playVelocity: chart.playVelocity || 0,
          growthRate: chart.growthRate || 0
        });
        
        // Stop once we have enough tracks
        if (countryTracks.length >= limit) break;
      }
    }
    
    // Sort by country score
    countryTracks.sort((a, b) => b.countryScore - a.countryScore);
    
    // Assign country ranks
    countryTracks.forEach((track, index) => {
      track.countryRank = index + 1;
      track.country = countryCode;
    });
    
    const endTime = Date.now();
    console.log(`   ⚡ Query completed in ${endTime - startTime}ms - Returning ${countryTracks.length} tracks`);
    
    return countryTracks.slice(0, limit);
  } catch (error) {
    console.error('Error getting country charts:', error);
    throw error;
  }
}

/**
 * Fallback method for country charts (less efficient)
 */
async function getCountryChartsFallback(countryCode, timeWindow, limit) {
  const tracksWithScores = await calculateScoresForTimeWindow(timeWindow);
  
  // Filter by country using ListenerGeography data
  const ListenerGeography = require('../models/ListenerGeography');
  
  const countryTracks = [];
  for (const track of tracksWithScores) {
    const countryStats = await ListenerGeography.aggregate([
      {
        $match: {
          trackId: track._id,
          country: countryCode.toUpperCase()
        }
      },
      {
        $group: {
          _id: '$trackId',
          plays: { $sum: 1 },
          uniqueListeners: { $addToSet: '$ipAddress' }
        }
      }
    ]);
    
    if (countryStats.length > 0) {
      const stats = countryStats[0];
      const countryScore = (stats.plays * 0.6) + (stats.uniqueListeners.length * 0.4);
      
      countryTracks.push({
        ...track,
        countryScore,
        countryPlays: stats.plays,
        countryUniqueListeners: stats.uniqueListeners.length
      });
    }
  }
  
  // Sort by country score
  countryTracks.sort((a, b) => b.countryScore - a.countryScore);
  
  // Assign country ranks
  countryTracks.forEach((track, index) => {
    track.countryRank = index + 1;
    track.country = countryCode;
  });
  
  return countryTracks.slice(0, limit);
}

/**
 * Get genre-specific charts
 * @param {string} genre - Genre name
 * @param {string} timeWindow - Time window
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Filtered charts
 */
async function getGenreCharts(genre, timeWindow = 'weekly', limit = 50) {
  try {
    const tracksWithScores = await calculateScoresForTimeWindow(timeWindow);
    
    // Filter by genre
    const genreTracks = tracksWithScores.filter(track => 
      track.genre?.toLowerCase() === genre.toLowerCase()
    );
    
    // Assign genre ranks
    genreTracks.forEach((track, index) => {
      track.genreRank = index + 1;
    });
    
    return genreTracks.slice(0, limit);
  } catch (error) {
    console.error('Error getting genre charts:', error);
    throw error;
  }
}

module.exports = {
  calculateTrackScore,
  calculateScoresForTimeWindow,
  updateChartScores,
  getCountryCharts,
  getGenreCharts,
  getTimeWindowRange,
  CHART_WEIGHTS
};
