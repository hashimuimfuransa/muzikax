# Redis Caching Quick Reference

## 🚀 Quick Start

### 1. Import Redis Cache
```javascript
const redisCache = require('../utils/redisCache');
```

### 2. Basic Usage Pattern
```javascript
// Try cache first
const cachedData = await redisCache.get('my:key');
if (cachedData) {
  console.log('📦 Cache hit');
  return cachedData;
}

// Fetch from database if not cached
const data = await fetchDataFromDatabase();

// Cache the result
await redisCache.set('my:key', data, 3600); // 1 hour TTL

return data;
```

## 📋 Common Patterns

### Pattern 1: Simple Key-Value
```javascript
const key = `user:${userId}`;
const cached = await redisCache.get(key);
if (cached) return cached;

const user = await User.findById(userId);
await redisCache.set(key, user, 1800); // 30 min
return user;
```

### Pattern 2: Parameterized Queries
```javascript
const params = { limit, sortBy, genre };
const key = `tracks:${JSON.stringify(params)}`;
const cached = await redisCache.get(key);
if (cached) return cached;

const tracks = await Track.find().limit(limit).sort(sortBy);
await redisCache.set(key, tracks, 900); // 15 min
return tracks;
```

### Pattern 3: Counter/Analytics
```javascript
// Increment counter
await redisCache.incr(`analytics:plays:${trackId}`);

// Get current count
const count = await redisCache.get(`analytics:plays:${trackId}`);

// Set with expiration
await redisCache.set(`analytics:plays:${trackId}`, count, 86400); // 24h
```

### Pattern 4: Invalidate on Update
```javascript
async function updateTrack(trackId, updates) {
  const track = await Track.findByIdAndUpdate(trackId, updates);
  
  // Invalidate cache
  await redisCache.invalidateTrackCache();
  // Or specific key
  await redisCache.del(`track:${trackId}`);
  
  return track;
}
```

## 🔑 Key Naming Conventions

### Recommended Format
```
{entity}:{identifier}:{optional-details}
```

### Examples
```javascript
// Users
`user:${userId}`
`user:${userId}:profile`
`user:${userId}:stats`

// Tracks
`track:${trackId}`
`tracks:monthly:${limit}`
`tracks:trending:${JSON.stringify({limit, sortBy})}`
`tracks:type:${type}:${limit}`
`tracks:all:${page}:${limit}:${sortBy}:${sortOrder}`

// Charts
`charts:global:${JSON.stringify({timeWindow, limit})}`
`charts:country:${countryCode}`
`charts:genre:${genre}`

// Analytics
`analytics:plays:${trackId}`
`analytics:views:${contentId}`
`analytics:likes:${postId}`

// Sessions
`session:${sessionId}`
`session:user:${userId}`
```

## ⏱️ TTL Guidelines

### Short TTL (5-15 minutes)
- Frequently changing data
- Real-time feeds
- User-generated content lists

```javascript
await redisCache.set('feed:recent', data, 300); // 5 min
await redisCache.set('tracks:all:...', data, 900); // 15 min
```

### Medium TTL (30-60 minutes)
- Popular queries
- Chart data
- Aggregated statistics

```javascript
await redisCache.set('tracks:monthly:...', data, 1800); // 30 min
await redisCache.set('charts:global:...', data, 3600); // 1 hour
```

### Long TTL (2-24 hours)
- Metadata
- Configuration
- User profiles (less frequent changes)

```javascript
await redisCache.set('metadata:genres', data, 7200); // 2 hours
await redisCache.set('user:${userId}', data, 86400); // 24 hours
```

## 🎯 What to Cache

### ✅ Good Candidates for Caching

1. **Expensive Database Queries**
   - Aggregations (`aggregate()`)
   - Joins/populates across collections
   - Complex filters with multiple conditions

2. **High-Traffic Endpoints**
   - Home page data
   - Trending/popular lists
   - Chart data
   - Public endpoints (no auth required)

3. **Static/Semi-Static Data**
   - Genre lists
   - Country codes
   - Configuration settings
   - Metadata

### ❌ Don't Cache

1. **User-Specific Data** (unless properly isolated)
   - Private user profiles
   - Authentication tokens
   - Personal messages

2. **Real-Time Critical Data**
   - Live notifications
   - Instant messaging
   - Real-time analytics

3. **Very Fast Queries** (< 50ms)
   - Simple lookups by ID
   - Already indexed queries
   - Small datasets

## 🔄 Invalidation Strategies

### Strategy 1: Time-Based (TTL)
Let caches expire naturally:
```javascript
await redisCache.set('key', data, 3600); // Auto-expires in 1 hour
```

### Strategy 2: Manual Invalidation on Write
Invalidate when data changes:
```javascript
async function createTrack(trackData) {
  const track = await Track.create(trackData);
  await redisCache.invalidateTrackCache();
  return track;
}
```

### Strategy 3: Pattern-Based Invalidation
Clear related caches:
```javascript
// Invalidate all track caches
await redisCache.invalidatePattern('tracks:*');

// Invalidate user-specific caches
await redisCache.invalidatePattern(`user:${userId}:*`);
```

### Strategy 4: Hybrid
Combine TTL + manual invalidation:
```javascript
// Set with TTL
await redisCache.set('key', data, 1800);

// Also invalidate on update
async function updateData(id, updates) {
  const updated = await Model.findByIdAndUpdate(id, updates);
  await redisCache.del(`key:${id}`);
  return updated;
}
```

## 🛠️ Helper Methods Reference

### Generic Methods
```javascript
// Get value
const data = await redisCache.get('key');

// Set value with TTL (seconds)
await redisCache.set('key', data, 3600);

// Delete key
await redisCache.del('key');

// Increment counter
await redisCache.incr('counter:key');

// Decrement counter
await redisCache.decr('counter:key');

// Invalidate by pattern
await redisCache.invalidatePattern('pattern:*');
```

### Track Methods
```javascript
// Monthly popular
await redisCache.getCachedMonthlyPopular(limit);
await redisCache.cacheMonthlyPopular(limit, data);

// Trending
await redisCache.getCachedTrending({limit, sortBy});
await redisCache.cacheTrending({limit, sortBy}, data);

// By type
await redisCache.getCachedTracksByType(type, limit);
await redisCache.cacheTracksByType(type, limit, data);

// Invalidate all tracks
await redisCache.invalidateTrackCache();
```

### Chart Methods
```javascript
// Get/set charts
await redisCache.getCachedCharts(type, params);
await redisCache.cacheCharts(type, params, data);

// Invalidate all charts
await redisCache.invalidateAllChartsCache();
```

### User Methods
```javascript
// User data
await redisCache.getCachedUser(userId);
await redisCache.cacheUser(userId, userData);

// Invalidate user cache
await redisCache.invalidateUserCache(userId);
```

### Analytics Methods
```javascript
// Increment counters
await redisCache.incrementPlayCount(trackId);
await redisCache.incrementViewCount(contentId);
```

### Health Check
```javascript
const health = await redisCache.healthCheck();
console.log(health.status); // 'healthy', 'disconnected', 'unhealthy'
```

## 📊 Monitoring & Debugging

### Enable Logging
The system automatically logs:
- `📦 Cache hit` - Successful cache retrieval
- `💾 Cache miss` - Cache miss, fetching from DB
- `✅ Redis connected` - Successful connection
- `❌ Redis error` - Connection issues
- `♻️ Invalidated X keys` - Cache clearing

### Check Cache Performance
```javascript
// In your controller, add timing
const start = Date.now();
const cached = await redisCache.get('key');
const cacheTime = Date.now() - start;
console.log(`Cache lookup: ${cacheTime}ms`);

const dbStart = Date.now();
const data = await fetchDataFromDB();
const dbTime = Date.now() - dbStart;
console.log(`DB query: ${dbTime}ms`);

console.log(`Speedup: ${((dbTime - cacheTime) / dbTime * 100).toFixed(2)}% faster`);
```

## 🔧 Troubleshooting

### Issue: Cache Not Working
**Check:**
1. Redis is connected (`✅ Redis connected` in logs)
2. Environment variables are set correctly
3. Keys are consistent between get/set operations

### Issue: Stale Data
**Solution:**
1. Reduce TTL for frequently changing data
2. Add manual invalidation on data updates
3. Use versioned keys: `key:v1`, `key:v2`

### Issue: Memory Concerns
**Solution:**
1. Use appropriate TTLs (don't cache forever)
2. Cache only heavy queries
3. Monitor Redis memory usage in Upstash dashboard

## 💡 Pro Tips

1. **Use JSON.stringify for Complex Keys**
   ```javascript
   const key = `query:${JSON.stringify({limit, sort, filter})}`;
   ```

2. **Batch Operations**
   ```javascript
   // Cache multiple items at once
   const promises = items.map(item => 
     redisCache.set(`item:${item.id}`, item, 3600)
   );
   await Promise.all(promises);
   ```

3. **Fallback Pattern**
   ```javascript
   try {
     const cached = await redisCache.get('key');
     if (cached) return cached;
   } catch (error) {
     console.error('Redis error, using DB:', error);
   }
   
   // Always have DB fallback
   return await fetchDataFromDatabase();
   ```

4. **Conditional Caching**
   ```javascript
   // Only cache if result is significant
   if (data.length > 0) {
     await redisCache.set('key', data, 1800);
   }
   ```

---

**Quick Copy-Paste Snippets:**

```javascript
// Basic cache pattern
const redisCache = require('../utils/redisCache');

const cached = await redisCache.get('my:key');
if (cached) return cached;

const data = await fetchData();
await redisCache.set('my:key', data, 3600);
return data;

// Invalidate on update
await redisCache.invalidatePattern('my:*');

// Counter
await redisCache.incr(`analytics:${eventId}`);
```
