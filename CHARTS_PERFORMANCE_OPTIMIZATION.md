# Charts & Recommendations Performance Optimization

## Problem Summary
- **Country charts endpoint** (`/api/charts/RW`) was taking ~9 seconds
- **Personalized recommendations** (`/api/recommendations/ml-recommendations/personalized`) was taking ~16 seconds
- Both endpoints were recalculating scores on every request without caching

## Optimizations Implemented

### 1. Country Charts Caching ✅
**File:** `backend/src/controllers/chartController.js`

**Changes:**
- Added Redis caching layer for country-specific charts
- Cache key format: `charts:country:{countryCode}:{timeWindow}:{limit}`
- Cache TTL: 1 hour (3600 seconds)
- Subsequent requests will be served from cache in milliseconds

**Expected Performance:**
- First request: ~2-3 seconds (with optimized ChartScore usage)
- Cached requests: <100ms

### 2. Optimized Country Charts Calculation ✅
**File:** `backend/src/services/chartService.js`

**Changes:**
- **Before:** Calculated scores for ALL tracks on every request using `calculateScoresForTimeWindow()`
- **After:** Uses pre-calculated `ChartScore` collection data
- Queries only top `(limit * 3)` tracks instead of all tracks
- Early exit once enough country-specific tracks are found
- Fallback method available for when ChartScore data is empty

**Performance Improvement:**
- Reduced database queries significantly
- No longer needs to calculate scores for entire track library
- Uses indexed ChartScore data for faster retrieval

**Expected Performance:**
- Before: ~9000ms
- After (first request): ~2000-3000ms
- After (cached): <100ms

### 3. Personalized Recommendations Caching ✅
**File:** `backend/src/controllers/recommendationController.js`

**Changes:**
- Added Redis caching for personalized recommendations
- Cache key format: `recommendations:personalized:{userId}:{limit}:{sortBy}`
- Cache TTL: 30 minutes (1800 seconds)
- Location-based requests bypass cache (dynamic content)
- Added logging for sort and location parameters

**Expected Performance:**
- First request: ~500-800ms (database query + user lookup)
- Cached requests: <50ms

### 4. Location Parameter Support ✅
**Enhancement:**
- Added `location` query parameter handling
- Logs location for future optimization
- Can be extended to filter by local creators/tracks
- Currently doesn't cache location-specific requests to ensure freshness

**Usage Example:**
```
GET /api/recommendations/ml-recommendations/personalized?limit=10&sortBy=recent&location=RW
```

## Testing Instructions

### Test Country Charts
```bash
# First request (cache miss - should be slower)
curl "http://localhost:5000/api/charts/RW?timeWindow=weekly&limit=50"

# Second request (cache hit - should be fast)
curl "http://localhost:5000/api/charts/RW?timeWindow=weekly&limit=50"

# Different country (cache miss)
curl "http://localhost:5000/api/charts/US?timeWindow=weekly&limit=50"
```

### Test Personalized Recommendations
```bash
# With authentication token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/recommendations/ml-recommendations/personalized?limit=10&sortBy=recent"

# With location parameter
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/recommendations/ml-recommendations/personalized?limit=10&sortBy=recent&location=RW"
```

### Monitor Redis Cache
```bash
# Check if Upstash Redis is working
# Look for these log messages:
# ✅ Redis (Upstash) connected successfully
# 📦 Cache hit: [type]
# 💾 Cache miss: [type]
```

## Performance Metrics

### Before Optimization
| Endpoint | Response Time |
|----------|--------------|
| `/api/charts/RW` | ~9,000ms |
| `/api/recommendations/personalized` | ~16,000ms |

### Expected After Optimization
| Endpoint | First Request | Cached Request |
|----------|--------------|----------------|
| `/api/charts/RW` | ~2,000-3,000ms | <100ms |
| `/api/recommendations/personalized` | ~500-800ms | <50ms |

**Performance Gain:**
- Country charts: **30-90x faster** (when cached)
- Recommendations: **20-300x faster** (when cached)

## Cache Invalidation

Charts cache will automatically expire after:
- **Country/Global charts:** 1 hour
- **Trending charts:** 30 minutes
- **Personalized recommendations:** 30 minutes

To manually invalidate cache:
```javascript
// Invalidate all country charts
await redisCache.invalidatePattern('charts:country:*');

// Invalidate specific country
await redisCache.del('charts:country:RW:weekly:50');

// Invalidate user recommendations
await redisCache.del('recommendations:personalized:USER_ID:10:recent');
```

## Future Enhancements

### 1. Pre-compute Country Charts
- Run scheduled job to calculate country charts hourly
- Store results in ChartScore collection
- Eliminate real-time aggregation entirely

### 2. Geographic Indexing
- Add country field to Track model
- Create database indexes on country fields
- Enable direct filtering without ListenerGeography lookups

### 3. Smart Pre-fetching
- Predict which countries/users will request charts
- Pre-warm cache during low-traffic periods
- Background refresh of popular charts

### 4. Location-Based Recommendations
- Add location metadata to creator profiles
- Weight recommendations by geographic proximity
- Cache location-specific recommendation sets

## Dependencies
- Upstash Redis (serverless Redis)
- MongoDB with proper indexes on ChartScore
- Node.js fetch API for Python ML communication

## Monitoring

Watch backend logs for:
```
✅ Redis (Upstash) connected successfully
📦 Cache hit: Country charts (RW)
💾 Cache miss: Fetching from database for RW
♻️  Invalidated X cache keys matching: charts:*
```

## Rollback Plan

If issues occur:
1. Check Redis connection in `.env`:
   ```
   REDIS_URL=your_redis_url
   REDIS_TOKEN=your_redis_token
   ```

2. If Redis is unavailable, system automatically falls back to database queries

3. To disable caching temporarily, comment out Redis calls in controllers

---

**Status:** ✅ Implemented and Ready for Testing
**Date:** March 24, 2026
**Impact:** Significant performance improvement for all users, especially in Rwanda (RW) and other African markets
