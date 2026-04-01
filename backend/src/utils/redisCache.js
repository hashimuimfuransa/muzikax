const { Redis } = require('@upstash/redis');

class RedisCache {
  constructor() {
    this.client = null;
    this.connected = false;
    this.errorLogged = false;
    this.ttl = {
      charts: 300,         // 5 minutes for charts (reduced from 1 hour for fresher data)
      trending: 180,       // 3 minutes for trending
      monthly: 300,        // 5 minutes for monthly popular
      metadata: 7200,      // 2 hours for metadata
      tracks: 900,         // 15 minutes for track lists
      user: 1800,          // 30 minutes for user data
      session: 86400,      // 24 hours for sessions
      default: 300         // 5 minutes default
    };
  }

  async connect() {
    try {
      // Use Upstash Redis (serverless)
      const redisUrl = process.env.REDIS_URL || 'https://localhost:6379';
      const redisToken = process.env.REDIS_TOKEN;
      
      if (!redisUrl || !redisToken) {
        throw new Error('REDIS_URL and REDIS_TOKEN environment variables are required');
      }
      
      // Create Upstash Redis client
      this.client = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      
      // Test connection with a simple ping
      await this.client.ping();
      
      this.connected = true;
      console.log('✅ Redis (Upstash) connected successfully - Caching enabled for better performance');
      this.errorLogged = false;
      
      return true;
    } catch (error) {
      // Only log error once to prevent spam
      if (!this.errorLogged) {
        console.error('❌ Redis connection failed:', error.message);
        console.log('📝 Application will work without caching (using database directly)');
        this.errorLogged = true;
      }
      this.connected = false;
      return false;
    }
  }

  // Generic cache methods
  async get(key) {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      // Handle case where data might already be an object (Upstash can auto-parse)
      if (!data) {
        return null;
      }
      // If data is already an object, return it directly
      if (typeof data === 'object') {
        return data;
      }
      // Otherwise parse the JSON string
      return JSON.parse(data);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.ttl.default) {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      // Upstash Redis uses set with EX option
      await this.client.set(key, JSON.stringify(value), { ex: ttl });
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async incr(key) {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  async decr(key) {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error('Redis DECR error:', error);
      return null;
    }
  }

  async invalidatePattern(pattern) {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`♻️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.error('Redis invalidate pattern error:', error);
      return false;
    }
  }

  // Chart-specific cache methods
  async getCachedCharts(type, params) {
    try {
      // Create a stable key by sorting object keys
      const paramsStr = JSON.stringify(params, Object.keys(params).sort());
      const key = `charts:${type}:${paramsStr}`;
      return await this.get(key);
    } catch (error) {
      console.error('Error getting cached charts:', error);
      return null;
    }
  }

  async cacheCharts(type, params, data) {
    try {
      // Create a stable key by sorting object keys
      const paramsStr = JSON.stringify(params, Object.keys(params).sort());
      const key = `charts:${type}:${paramsStr}`;
      const ttl = type === 'trending' ? this.ttl.trending : this.ttl.charts;
      return await this.set(key, data, ttl);
    } catch (error) {
      console.error('Error caching charts:', error);
      return false;
    }
  }

  // Track caching methods
  async getCachedMonthlyPopular(limit) {
    const key = `tracks:monthly:${limit}`;
    return await this.get(key);
  }

  async cacheMonthlyPopular(limit, data) {
    const key = `tracks:monthly:${limit}`;
    return await this.set(key, data, this.ttl.monthly);
  }

  async getCachedTrending(params) {
    try {
      const key = `tracks:trending:${JSON.stringify(params, Object.keys(params).sort())}`;
      return await this.get(key);
    } catch (error) {
      console.error('Error getting cached trending:', error);
      return null;
    }
  }

  async cacheTrending(params, data) {
    try {
      const key = `tracks:trending:${JSON.stringify(params, Object.keys(params).sort())}`;
      return await this.set(key, data, this.ttl.trending);
    } catch (error) {
      console.error('Error caching trending:', error);
      return false;
    }
  }

  async getCachedTracksByType(type, limit) {
    const key = `tracks:type:${type}:${limit}`;
    return await this.get(key);
  }

  async cacheTracksByType(type, limit, data) {
    const key = `tracks:type:${type}:${limit}`;
    return await this.set(key, data, this.ttl.tracks);
  }

  // User/Creator caching
  async getCachedUser(userId) {
    const key = `user:${userId}`;
    return await this.get(key);
  }

  async cacheUser(userId, userData) {
    const key = `user:${userId}`;
    return await this.set(key, userData, this.ttl.user);
  }

  // Session caching
  async getCachedSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async cacheSession(sessionId, sessionData) {
    const key = `session:${sessionId}`;
    return await this.set(key, sessionData, this.ttl.session);
  }

  // Analytics counters
  async incrementPlayCount(trackId) {
    const key = `analytics:plays:${trackId}`;
    return await this.incr(key);
  }

  async incrementViewCount(contentId) {
    const key = `analytics:views:${contentId}`;
    return await this.incr(key);
  }

  // Invalidate all track caches
  async invalidateTrackCache() {
    await this.invalidatePattern('tracks:*');
  }

  async invalidateUserCache(userId) {
    await this.invalidatePattern(`user:${userId}`);
  }

  async invalidateAllChartsCache() {
    return await this.invalidatePattern('charts:*');
  }

  // Health check
  async healthCheck() {
    if (!this.connected || !this.client) {
      return { status: 'disconnected', latency: 0 };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Singleton instance
const redisCache = new RedisCache();

module.exports = redisCache;
