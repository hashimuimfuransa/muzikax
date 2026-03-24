/**
 * Example: Using Redis Cache in Controllers
 * 
 * This file demonstrates various Redis caching patterns
 * that can be applied to other controllers/services
 */

const redisCache = require('../utils/redisCache');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Playlist = require('../models/Playlist');

/**
 * Example 1: Cache User Profile
 * Use case: Frequently accessed user data
 */
async function getUserProfile(userId) {
  try {
    // Try cache first
    const cached = await redisCache.getCachedUser(userId);
    if (cached) {
      console.log(`📦 Cache hit: User ${userId}`);
      return cached;
    }
    
    console.log(`💾 Cache miss: Fetching user ${userId} from database`);
    
    // Fetch from database
    const user = await User.findById(userId).select('-password');
    
    // Cache the result (30 minutes)
    await redisCache.cacheUser(userId, user);
    
    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Example 2: Cache Comments with Pagination
 * Use case: Comments on tracks (high traffic)
 */
async function getTrackComments(trackId, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const cacheKey = `comments:${trackId}:${page}:${limit}`;
    
    // Try cache first
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit: Comments for track ${trackId}`);
      return cached;
    }
    
    console.log(`💾 Cache miss: Fetching comments for track ${trackId}`);
    
    // Fetch from database
    const comments = await Comment.find({ trackId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar');
    
    const total = await Comment.countDocuments({ trackId });
    
    const response = {
      comments,
      page,
      pages: Math.ceil(total / limit),
      total
    };
    
    // Cache for 15 minutes
    await redisCache.set(cacheKey, response, 900);
    
    return response;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

/**
 * Example 3: Cache Playlists
 * Use case: User playlists (semi-static)
 */
async function getUserPlaylists(userId) {
  try {
    const cacheKey = `playlists:user:${userId}`;
    
    // Try cache first
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit: Playlists for user ${userId}`);
      return cached;
    }
    
    console.log(`💾 Cache miss: Fetching playlists for user ${userId}`);
    
    // Fetch from database
    const playlists = await Playlist.find({ userId })
      .sort({ createdAt: -1 })
      .populate('tracks', 'title artist coverURL');
    
    // Cache for 1 hour
    await redisCache.set(cacheKey, playlists, 3600);
    
    return playlists;
  } catch (error) {
    console.error('Error getting playlists:', error);
    throw error;
  }
}

/**
 * Example 4: Cache Search Results
 * Use case: Popular search queries
 */
async function searchTracks(query, filters = {}) {
  try {
    // Create cache key from query and filters
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    
    // Try cache first
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit: Search results for "${query}"`);
      return cached;
    }
    
    console.log(`💾 Cache miss: Searching for "${query}"`);
    
    // Build search query
    const searchQuery = {
      title: { $regex: query, $options: 'i' },
      ...filters
    };
    
    // Execute search
    const results = await Track.find(searchQuery)
      .limit(50)
      .populate('creatorId', 'name avatar');
    
    // Cache for 30 minutes (searches are expensive)
    await redisCache.set(cacheKey, results, 1800);
    
    return results;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
}

/**
 * Example 5: Increment View/Play Count
 * Use case: Real-time analytics
 */
async function incrementTrackPlays(trackId) {
  try {
    // Increment Redis counter
    const newCount = await redisCache.incrementPlayCount(trackId);
    
    // Also update database (async, don't wait)
    Track.findByIdAndUpdate(trackId, {
      $inc: { plays: 1 }
    }).catch(err => console.error('Error updating play count:', err));
    
    return newCount;
  } catch (error) {
    console.error('Error incrementing play count:', error);
    // Fallback to database only
    const track = await Track.findByIdAndUpdate(trackId, {
      $inc: { plays: 1 }
    }, { new: true });
    return track?.plays || 0;
  }
}

/**
 * Example 6: Cache Statistics/Analytics
 * Use case: Dashboard metrics
 */
async function getPlatformStats() {
  try {
    const cacheKey = 'stats:platform';
    
    // Try cache first
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log('📦 Cache hit: Platform stats');
      return cached;
    }
    
    console.log('💾 Cache miss: Calculating platform stats');
    
    // Expensive aggregations
    const [
      totalTracks,
      totalUsers,
      totalPlays,
      topGenre
    ] = await Promise.all([
      Track.countDocuments(),
      User.countDocuments(),
      PlayHistory.aggregate([
        { $group: { _id: null, total: { $sum: 1 } } }
      ]),
      Track.aggregate([
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);
    
    const stats = {
      totalTracks,
      totalUsers,
      totalPlays: totalPlays[0]?.total || 0,
      topGenre: topGenre[0]?._id || 'Unknown',
      lastUpdated: new Date()
    };
    
    // Cache for 1 hour
    await redisCache.set(cacheKey, stats, 3600);
    
    return stats;
  } catch (error) {
    console.error('Error getting platform stats:', error);
    throw error;
  }
}

/**
 * Example 7: Invalidate Cache on Update
 * Use case: When data changes, clear related caches
 */
async function updateUserProfile(userId, updates) {
  try {
    // Update database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-password');
    
    // Invalidate user cache
    await redisCache.invalidateUserCache(userId);
    
    // Also invalidate user's playlists cache
    await redisCache.invalidatePattern(`playlists:user:${userId}`);
    
    console.log(`♻️ Invalidated cache for user ${userId}`);
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Example 8: Cache with Conditional Logic
 * Use case: Only cache significant results
 */
async function getRelatedTracks(trackId, genre) {
  try {
    const cacheKey = `related:${trackId}:${genre}`;
    
    // Try cache first
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Find related tracks
    const related = await Track.find({
      genre,
      _id: { $ne: trackId }
    })
    .sort({ plays: -1 })
    .limit(10)
    .populate('creatorId', 'name avatar');
    
    // Only cache if we have results
    if (related.length > 0) {
      await redisCache.set(cacheKey, related, 1800);
    }
    
    return related;
  } catch (error) {
    console.error('Error getting related tracks:', error);
    return [];
  }
}

/**
 * Example 9: Batch Cache Operations
 * Use case: Cache multiple items efficiently
 */
async function cacheMultipleTracks(tracks) {
  try {
    // Cache each track individually for quick lookup
    const cachePromises = tracks.map(async (track) => {
      const key = `track:${track._id}`;
      await redisCache.set(key, track, 3600);
    });
    
    await Promise.all(cachePromises);
    console.log(`✅ Cached ${tracks.length} tracks`);
    
  } catch (error) {
    console.error('Error batch caching:', error);
  }
}

/**
 * Example 10: Health Check & Monitoring
 * Use case: Check Redis status
 */
async function checkRedisHealth() {
  try {
    const health = await redisCache.healthCheck();
    
    console.log('Redis Health:', health);
    
    return {
      status: health.status,
      latency: health.latency || 0,
      connected: redisCache.connected
    };
  } catch (error) {
    console.error('Redis health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      connected: false
    };
  }
}

// Export all examples
module.exports = {
  getUserProfile,
  getTrackComments,
  getUserPlaylists,
  searchTracks,
  incrementTrackPlays,
  getPlatformStats,
  updateUserProfile,
  getRelatedTracks,
  cacheMultipleTracks,
  checkRedisHealth
};
