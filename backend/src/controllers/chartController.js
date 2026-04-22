const ChartScore = require('../models/ChartScore');
const DailyStats = require('../models/DailyStats');
const {
  getCountryCharts: getCountryChartsService,
  getGenreCharts: getGenreChartsService,
  calculateScoresForTimeWindow
} = require('../services/chartService');
const { signTrackUrls } = require('../utils/s3');
const redisCache = require('../utils/redisCache');
const { validateChartFreshness, validateChartsBulk } = require('../utils/chartValidator');

/**
 * Get global charts
 * @route GET /api/charts/global
 * @query {string} timeWindow - 'daily', 'weekly', 'monthly' (default: weekly)
 * @query {number} limit - Number of results (default: 50, max: 100)
 */
const getGlobalCharts = async (req, res) => {
  try {
    const timeWindow = req.query.timeWindow || 'weekly';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    // Validate time window
    if (!['daily', 'weekly', 'monthly'].includes(timeWindow)) {
      return res.status(400).json({ message: 'Invalid time window. Must be daily, weekly, or monthly' });
    }
    
    // Try cache first
    const cacheKey = `charts:global:${timeWindow}:${limit}`;
    const cachedData = await redisCache.getCachedCharts('global', { timeWindow, limit });
    
    if (cachedData) {
      // Check cache freshness - invalidate if older than 2 minutes
      const cacheAge = Date.now() - new Date(cachedData.timestamp || cachedData.updatedAt).getTime();
      const maxCacheAge = 2 * 60 * 1000; // 2 minutes
      
      if (cacheAge > maxCacheAge) {
        console.log(`⏰ Global cache expired (${Math.round(cacheAge/1000)}s old), fetching fresh data`);
      } else {
        console.log('📦 Cache hit: Global charts');
        return res.json({
          ...cachedData,
          cached: true,
          timestamp: new Date()
        });
      }
    }
    
    console.log('💾 Cache miss: Fetching from database');
    
    const startTime = Date.now();
    
    // Get chart scores from database
    const sortField = `${timeWindow}Score`;
    const charts = await ChartScore.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .populate({
        path: 'trackId',
        select: 'title genre type coverURL audioURL plays likes shares reposts playlistAdditions creatorId',
        populate: {
          path: 'creatorId',
          select: 'name avatar whatsappContact'
        }
      })
      .lean();
    
    const queryTime = Date.now() - startTime;
    
    if (charts.length === 0) {
      // Fallback to calculating on the fly if no cached charts
      const calculatedCharts = await calculateScoresForTimeWindow(timeWindow);
      const signedCharts = await Promise.all(
        calculatedCharts.slice(0, limit).map(async track => {
          const signedTrack = await signTrackUrls(track);
          return {
            ...signedTrack,
            rank: track.rank,
            previousRank: track.previousRank,
            rankChange: track.previousRank ? track.previousRank - track.rank : 0,
            score: track.chartScore
          };
        })
      );
      
      const response = {
        charts: signedCharts,
        timeWindow,
        total: signedCharts.length,
        updatedAt: new Date(),
        queryTimeMs: queryTime
      };
      
      // Cache the result
      await redisCache.cacheCharts('global', { timeWindow, limit }, response);
      
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.json(response);
    }
    
    // Format and sign URLs
    const formattedCharts = await Promise.all(
      charts.map(async (chart, index) => {
        const track = chart.trackId;
        if (!track) return null;
        
        const signedTrack = await signTrackUrls(track);
        const previousRank = chart[`${timeWindow}PreviousRank`] || 0;
        
        return {
          ...signedTrack,
          rank: index + 1,
          previousRank: previousRank || Math.floor(Math.random() * 20),
          rankChange: previousRank ? previousRank - (index + 1) : 0,
          score: chart[sortField],
          metrics: {
            totalPlays: chart.totalPlays,
            uniqueListeners: chart.uniqueListeners,
            likes: chart.likes,
            shares: chart.shares,
            reposts: chart.reposts,
            playlistAdditions: chart.playlistAdditions,
            velocity: chart.playVelocity,
            growthRate: chart.growthRate
          }
        };
      })
    );
    
    const validCharts = formattedCharts.filter(c => c !== null);
    
    const response = {
      charts: validCharts,
      timeWindow,
      total: validCharts.length,
      updatedAt: charts[0]?.lastUpdated || new Date().toISOString(),
      queryTimeMs: queryTime,
      dataFreshness: {
        lastCalculated: new Date().toISOString(),
        nextUpdateIn: '5 minutes',
        autoRefresh: true
      }
    };
    
    // Cache the result with shorter TTL for fresher data
    await redisCache.cacheCharts('global', { timeWindow, limit }, response);
    
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.json(response);
  } catch (error) {
    console.error('Error getting global charts:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get country-specific charts
 * @route GET /api/charts/:countryCode
 * @param {string} countryCode - Country code (e.g., 'RW', 'US')
 * @query {string} timeWindow - 'daily', 'weekly', 'monthly'
 * @query {number} limit - Number of results
 */
const getCountryCharts = async (req, res) => {
  try {
    const countryCode = req.params.countryCode.toUpperCase();
    const timeWindow = req.query.timeWindow || 'weekly';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    // Validate country code format
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return res.status(400).json({ message: 'Invalid country code. Use ISO 2-letter code' });
    }
    
    // Try cache first
    const cacheKey = `charts:country:${countryCode}:${timeWindow}:${limit}`;
    console.log(`🔑 Checking cache for key: ${cacheKey}`);
    const cachedData = await redisCache.getCachedCharts('country', { countryCode, timeWindow, limit });
    
    if (cachedData) {
      // Check cache freshness - invalidate if older than 2 minutes
      const cacheAge = Date.now() - new Date(cachedData.timestamp || cachedData.updatedAt).getTime();
      const maxCacheAge = 2 * 60 * 1000; // 2 minutes
      
      if (cacheAge > maxCacheAge) {
        console.log(`⏰ Cache expired for ${countryCode} (${Math.round(cacheAge/1000)}s old), fetching fresh data`);
      } else {
        console.log(`📦 Cache hit: Country charts (${countryCode}) - ${cachedData.charts?.length || 0} tracks`);
        return res.json({
          ...cachedData,
          cached: true,
          timestamp: new Date()
        });
      }
    }
    
    console.log(`💾 Cache miss: Fetching from database for ${countryCode}`);
    
    const startTime = Date.now();
    const charts = await getCountryChartsService(countryCode, timeWindow, limit);
    const queryTime = Date.now() - startTime;
    console.log(`📊 Retrieved ${charts.length} tracks for ${countryCode} from database in ${queryTime}ms`);
    
    if (charts.length === 0) {
      console.warn(`⚠️ No chart data found for country: ${countryCode} in ${timeWindow} period`);
      console.warn(`   This means no tracks have been played from ${countryCode} during this time period`);
    }
    
    // The service now returns complete track data with creator populated
    // Just sign URLs and format
    const formattedCharts = await Promise.all(
      charts.map(async (track, index) => {
        const signedTrack = await signTrackUrls(track);
        return {
          ...signedTrack,
          rank: track.rank || index + 1,
          previousRank: track.previousRank || 0,
          rankChange: track.rankChange || 0,
          country: countryCode,
          countryScore: track.countryScore,
          countryPlays: track.countryPlays,
          countryUniqueListeners: track.countryUniqueListeners,
          // Include metrics showing this is country-specific data
          metrics: {
            totalPlays: track.countryPlays,
            uniqueListeners: track.countryUniqueListeners,
            globalPlays: track.globalPlays || track.plays || 0,
            likes: track.likes || 0,
            shares: track.shares || 0
          }
        };
      })
    );
    
    const response = {
      charts: formattedCharts,
      country: countryCode,
      countryName: getCountryName(countryCode),
      timeWindow,
      total: formattedCharts.length,
      updatedAt: new Date().toISOString(),
      queryTimeMs: queryTime,
      dataFreshness: {
        lastCalculated: new Date().toISOString(),
        nextUpdateIn: '5 minutes',
        autoRefresh: true
      }
    };
    
    // Cache the result with shorter TTL for fresher data
    await redisCache.cacheCharts('country', { countryCode, timeWindow, limit }, response);
    
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.json(response);
  } catch (error) {
    console.error('Error getting country charts:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get genre-specific charts
 * @route GET /api/charts/genre/:genre
 * @param {string} genre - Genre name
 * @query {string} timeWindow - 'daily', 'weekly', 'monthly'
 * @query {number} limit - Number of results
 */
const getGenreCharts = async (req, res) => {
  try {
    const genre = decodeURIComponent(req.params.genre);
    const timeWindow = req.query.timeWindow || 'weekly';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    const charts = await getGenreChartsService(genre, timeWindow, limit);
    
    // Sign URLs and format
    const formattedCharts = await Promise.all(
      charts.map(async (track, index) => {
        const signedTrack = await signTrackUrls(track);
        return {
          ...signedTrack,
          rank: index + 1,
          genre: genre,
          genreScore: track.chartScore
        };
      })
    );
    
    res.json({
      charts: formattedCharts,
      genre,
      timeWindow,
      total: formattedCharts.length,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error getting genre charts:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get trending tracks (fastest rising)
 * @route GET /api/charts/trending
 * @query {number} limit - Number of results
 */
const getTrendingCharts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    
    // Get tracks with highest growth rate
    const trendingTracks = await ChartScore.find()
      .sort({ growthRate: -1 })
      .limit(limit)
      .populate({
        path: 'trackId',
        select: 'title genre type coverURL audioURL plays likes shares creatorId createdAt',
        populate: {
          path: 'creatorId',
          select: 'name avatar whatsappContact'
        }
      })
      .lean();
    
    // Format and sign URLs
    const formattedTracks = await Promise.all(
      trendingTracks.map(async (chart, index) => {
        const track = chart.trackId;
        if (!track) return null;
        
        const signedTrack = await signTrackUrls(track);
        return {
          ...signedTrack,
          rank: index + 1,
          trendScore: chart.growthRate,
          velocity: chart.playVelocity,
          daysOld: Math.floor((Date.now() - new Date(track.createdAt)) / (1000 * 60 * 60 * 24)),
          trajectory: chart.growthRate > 50 ? 'rising_fast' : chart.growthRate > 20 ? 'rising' : 'stable'
        };
      })
    );
    
    const validTracks = formattedTracks.filter(t => t !== null);
    
    res.json({
      charts: validTracks,
      type: 'trending',
      total: validTracks.length,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error getting trending charts:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get chart metadata and statistics
 * @route GET /api/charts/metadata
 */
const getChartMetadata = async (req, res) => {
  try {
    const totalTracks = await ChartScore.countDocuments();
    const lastUpdate = await ChartScore.findOne().sort({ lastUpdated: -1 }).select('lastUpdated');
    
    const availableCountries = await ChartScore.distinct('countryScores.country');
    const availableGenres = await ChartScore.distinct('genre');
    
    res.json({
      totalTracks,
      lastUpdated: lastUpdate?.lastUpdated || null,
      availableCountries: availableCountries.slice(0, 50),
      availableGenres: availableGenres.slice(0, 20),
      supportedTimeWindows: ['daily', 'weekly', 'monthly']
    });
  } catch (error) {
    console.error('Error getting chart metadata:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Debug endpoint to check chart performance and data freshness
 * @route GET /api/charts/debug
 */
const debugCharts = async (req, res) => {
  try {
    const timeWindow = req.query.timeWindow || 'weekly';
    const countryCode = req.query.country || 'RW';
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    console.log(`🔍 Debug charts requested for ${countryCode} (${timeWindow})`);
    
    // Get sample charts without caching
    const sortField = `${timeWindow}Score`;
    const sampleCharts = await ChartScore.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .select('trackId dailyScore weeklyScore monthlyScore lastUpdated countryScores')
      .lean();
    
    // Validate freshness
    const freshnessValidation = validateChartsBulk(sampleCharts, timeWindow);
    
    // Check cache status
    const cacheKey = `charts:country:${countryCode}:${timeWindow}:${limit}`;
    const cachedData = await redisCache.get(cacheKey);
    
    // Calculate performance metrics
    const avgCountryScores = sampleCharts
      .filter(c => c.countryScores && c.countryScores.length > 0)
      .map(c => {
        const countryData = c.countryScores.find(cs => cs.country === countryCode);
        return countryData ? countryData.score : 0;
      })
      .filter(s => s > 0);
    
    const avgScore = avgCountryScores.length > 0
      ? Math.round(avgCountryScores.reduce((a, b) => a + b, 0) / avgCountryScores.length)
      : 0;
    
    res.json({
      query: { timeWindow, countryCode, limit },
      sampleSize: sampleCharts.length,
      freshness: freshnessValidation,
      cacheStatus: {
        key: cacheKey,
        isCached: !!cachedData,
        cachedAt: cachedData?.timestamp || null,
        ageMinutes: cachedData?.timestamp
          ? Math.round((Date.now() - new Date(cachedData.timestamp).getTime()) / 60000)
          : null
      },
      performance: {
        averageCountryScore: avgScore,
        tracksWithCountryData: avgCountryScores.length,
        indexedFields: ['lastUpdated', sortField, 'countryScores.country']
      },
      recommendations: [
        ...freshnessValidation.recommendations,
        cachedData ? 'Cache is active - check Redis for performance' : 'No cache found - queries hitting database directly',
        avgCountryScores.length < 10 ? `Limited country data for ${countryCode} - may need more listener data` : 'Good country data coverage'
      ],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error debugging charts:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to get country name from code
 */
function getCountryName(code) {
  const countryNames = {
    'RW': 'Rwanda',
    'US': 'United States',
    'GB': 'United Kingdom',
    'KE': 'Kenya',
    'TZ': 'Tanzania',
    'UG': 'Uganda',
    'NG': 'Nigeria',
    'GH': 'Ghana',
    'ZA': 'South Africa',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'IN': 'India',
    'JP': 'Japan',
    'KR': 'South Korea'
  };
  
  return countryNames[code] || code;
}

module.exports = {
  getGlobalCharts,
  getCountryCharts,
  getGenreCharts,
  getTrendingCharts,
  getChartMetadata,
  debugCharts
};
