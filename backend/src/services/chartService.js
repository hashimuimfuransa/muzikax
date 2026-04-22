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
    
    // Calculate date range based on time window
    const now = new Date();
    let startDate = new Date();
    
    switch (timeWindow) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0); // Start of today
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    console.log(`   📅 Date range: ${startDate.toISOString()} to ${now.toISOString()}`);
    
    // Step 1: Get ListenerGeography data for this country in the time period
    const ListenerGeography = require('../models/ListenerGeography');
    
    const countryStatsAgg = await ListenerGeography.aggregate([
      {
        $match: {
          country: countryCode.toUpperCase(),
          timestamp: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$trackId',
          countryPlays: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipAddress' },
          creatorId: { $first: '$creatorId' }
        }
      },
      {
        $project: {
          trackId: '$_id',
          countryPlays: 1,
          countryUniqueListeners: { $size: '$uniqueIPs' },
          creatorId: 1,
          _id: 0
        }
      },
      {
        $sort: { countryPlays: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    console.log(`   📍 Found ${countryStatsAgg.length} tracks with plays in ${countryCode} (${timeWindow})`);
    
    if (countryStatsAgg.length > 0) {
      console.log(`   📊 Top 3 tracks by plays:`);
      countryStatsAgg.slice(0, 3).forEach((stat, idx) => {
        console.log(`      ${idx + 1}. Track ${stat.trackId}: ${stat.countryPlays} plays, ${stat.countryUniqueListeners} unique listeners`);
      });
    }
    
    if (countryStatsAgg.length === 0) {
      console.log(`   ⚠️ No plays found for ${countryCode} in ${timeWindow} period`);
      return [];
    }
    
    // Step 2: Get track details for these tracks
    const trackIds = countryStatsAgg.map(stat => stat.trackId);
    
    const tracks = await Track.find({
      _id: { $in: trackIds },
      isPublic: { $ne: false }
    })
    .populate('creatorId', 'name avatar whatsappContact')
    .select('title genre type coverURL audioURL plays likes shares reposts playlistAdditions creatorId createdAt')
    .lean();
    
    console.log(`   🎵 Retrieved ${tracks.length} track details`);
    
    // Step 3: Create a map for fast lookup
    const trackMap = new Map();
    tracks.forEach(track => {
      trackMap.set(track._id.toString(), track);
    });
    
    // Step 4: Merge country stats with track info and calculate country score
    const countryTracks = [];
    
    for (const stat of countryStatsAgg) {
      const track = trackMap.get(stat.trackId.toString());
      
      if (track) {
        // Country score based primarily on plays from this country
        // Weight: 70% plays, 30% unique listeners
        const countryScore = (stat.countryPlays * 0.7) + (stat.countryUniqueListeners * 0.3);
        
        countryTracks.push({
          ...track,
          _id: track._id,
          countryScore,
          countryPlays: stat.countryPlays,
          countryUniqueListeners: stat.countryUniqueListeners,
          country: countryCode,
          // Include global metrics for reference
          globalPlays: track.plays || 0,
          globalLikes: track.likes || 0,
          globalShares: track.shares || 0
        });
      }
    }
    
    // Step 5: Sort by country plays (primary) and country score (secondary)
    countryTracks.sort((a, b) => {
      // Primary sort: country plays
      if (b.countryPlays !== a.countryPlays) {
        return b.countryPlays - a.countryPlays;
      }
      // Secondary sort: country score
      return b.countryScore - a.countryScore;
    });
    
    // Step 6: Assign ranks
    countryTracks.forEach((track, index) => {
      track.rank = index + 1;
      track.previousRank = 0; // Will be updated with historical data
      track.rankChange = 0;
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
  console.log(`   🔄 Using fallback method for ${countryCode} (${timeWindow})`);
  
  // Calculate date range based on time window
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
      startDate.setDate(now.getDate() - 7);
  }
  
  const ListenerGeography = require('../models/ListenerGeography');
  
  // Get all tracks with plays in this country during the time period
  const countryStats = await ListenerGeography.aggregate([
    {
      $match: {
        country: countryCode.toUpperCase(),
        timestamp: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: '$trackId',
        countryPlays: { $sum: 1 },
        uniqueListeners: { $addToSet: '$ipAddress' },
        creatorId: { $first: '$creatorId' }
      }
    },
    {
      $project: {
        trackId: '$_id',
        countryPlays: 1,
        countryUniqueListeners: { $size: '$uniqueListeners' },
        _id: 0
      }
    },
    {
      $sort: { countryPlays: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  if (countryStats.length === 0) {
    return [];
  }
  
  // Get track details
  const trackIds = countryStats.map(stat => stat.trackId);
  const tracks = await Track.find({
    _id: { $in: trackIds },
    isPublic: { $ne: false }
  })
  .populate('creatorId', 'name avatar')
  .lean();
  
  const trackMap = new Map();
  tracks.forEach(track => {
    trackMap.set(track._id.toString(), track);
  });
  
  // Merge and format
  const countryTracks = [];
  
  for (const stat of countryStats) {
    const track = trackMap.get(stat.trackId.toString());
    
    if (track) {
      const countryScore = (stat.countryPlays * 0.7) + (stat.countryUniqueListeners * 0.3);
      
      countryTracks.push({
        ...track,
        countryScore,
        countryPlays: stat.countryPlays,
        countryUniqueListeners: stat.countryUniqueListeners,
        country: countryCode
      });
    }
  }
  
  // Sort by country plays
  countryTracks.sort((a, b) => b.countryPlays - a.countryPlays);
  
  // Assign ranks
  countryTracks.forEach((track, index) => {
    track.countryRank = index + 1;
    track.rank = index + 1;
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
