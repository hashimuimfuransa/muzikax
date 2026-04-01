# Quick Start - Testing Chart Improvements

## 🚀 Step 1: Apply Database Indexes (One-Time)

```bash
cd c:\Users\Lenovo\muzikax
node backend/scripts/create-chart-indexes.js
```

Expected output:
```
✅ Created index: lastUpdated_weeklyScore_idx
✅ Created index: lastUpdated_dailyScore_idx
✅ Created index: lastUpdated_monthlyScore_idx
✅ Created index: country_lastUpdated_weeklyScore_idx
```

---

## 🚀 Step 2: Restart Backend Server

```bash
# Stop current server (Ctrl+C)
# Then restart
cd backend
npm start
```

Look for these logs:
```
[Chart Aggregator] Initialized successfully - Charts update every 5 minutes
[Chart Aggregator] Starting daily stats aggregation...
[Chart Aggregator] Updating chart scores...
```

---

## 🚀 Step 3: Test Performance

### Test 1: Check Query Speed
```bash
curl "http://localhost:5000/api/charts/RW?timeWindow=weekly&limit=20"
```

**What to look for in response:**
```json
{
  "queryTimeMs": 150,  // ✅ Should be < 200ms (was 34,000ms before!)
  "charts": [...],
  "updatedAt": "2026-04-01T..."
}
```

**What to look for in server logs:**
```
🌍 Getting country charts for: RW
   📊 Found 60 ChartScore documents (filtered by lastUpdated)
   📍 Batch query returned 20 tracks with listeners in RW
   ⚡ Query completed in 145ms - Returning 20 tracks
```

---

### Test 2: Check Data Freshness
```bash
curl "http://localhost:5000/api/charts/debug?country=RW"
```

**Expected response:**
```json
{
  "freshness": {
    "averageAgeMinutes": 3,      // ✅ Should be < 15 minutes
    "overallStatus": "healthy",  // ✅ Not "warning" or "critical"
    "freshCharts": 18,
    "staleCharts": 2
  },
  "cacheStatus": {
    "isCached": true,            // ✅ Cache is working
    "ageMinutes": 2              // ✅ Cache is fresh
  }
}
```

---

### Test 3: Monitor Real-Time Updates
Open two terminal windows:

**Terminal 1 - Watch aggregator logs:**
```bash
# Just keep the server running and watch logs
npm start --prefix backend
```

Every 5 minutes you should see:
```
[Chart Aggregator] Updating chart scores...
Updated chart scores for 150 tracks (daily)
Updated chart scores for 150 tracks (weekly)
Updated chart scores for 150 tracks (monthly)
```

**Terminal 2 - Make repeated requests:**
```bash
# Request every 10 seconds
while ($true) { 
  curl "http://localhost:5000/api/charts/RW?limit=5" | ConvertFrom-Json | Select-Object queryTimeMs, updatedAt
  Start-Sleep -Seconds 10 
}
```

Watch `queryTimeMs` stay consistently low (< 200ms)

---

## 📊 Before vs After Comparison

### BEFORE (Old Code):
```
Response Time: 34,000ms (34 seconds!) 😱
Database Queries: 81 queries per request
Data Age: Up to 1 hour old
Cache TTL: 3600 seconds
Aggregation: Every 60 minutes
```

### AFTER (New Code):
```
Response Time: < 200ms ✅
Database Queries: 2 queries per request
Data Age: < 15 minutes old
Cache TTL: 300 seconds (5 minutes)
Aggregation: Every 5 minutes
```

**Performance Improvement: 170x faster! 🚀**

---

## 🔍 Troubleshooting

### Problem: Still getting slow responses (> 1 second)

**Check 1: Are indexes created?**
```bash
node backend/scripts/create-chart-indexes.js
```

**Check 2: Is Redis connected?**
Look for this in server logs:
```
✅ Redis (Upstash) connected successfully - Caching enabled
```

If not connected, check `.env`:
```
REDIS_URL=https://your-redis-url.upstash.io
REDIS_TOKEN=your-token
```

---

### Problem: Data still seems old

**Check 1: Is aggregator running?**
Look for this log every 5 minutes:
```
[Chart Aggregator] Updating chart scores...
```

If not running, check that your backend started successfully.

**Check 2: Force manual update**
```javascript
// In backend console or separate script
const { updateAllChartScores } = require('./src/jobs/chartAggregator');
updateAllChartScores();
```

---

### Problem: No charts for country RW

**This means ListenerGeography collection is empty for Rwanda.**

**Solution: Seed test data**
```bash
# If you have the seed script
node backend/seed-country-data.js
```

Or wait for real users to generate plays from Rwanda.

---

## 📈 Monitoring Dashboard (Optional)

Create a simple monitoring page by calling:
```
http://localhost:5000/api/charts/debug?country=RW&timeWindow=weekly&limit=100
```

This returns comprehensive metrics about:
- Data freshness
- Cache status
- Query performance
- Recommendations

---

## ✅ Success Criteria

Your implementation is successful if:

- [ ] `queryTimeMs` < 200ms for all chart requests
- [ ] `freshness.averageAgeMinutes` < 15 minutes
- [ ] `freshness.overallStatus` = "healthy"
- [ ] Aggregator logs show updates every 5 minutes
- [ ] Cache hit rate > 90% (check debug endpoint)
- [ ] No N+1 query patterns in logs (should see "Batch query returned")

---

## 🎯 Next Steps

Once verified, consider:

1. **Production Deployment**: Deploy changes to production
2. **Monitor Performance**: Set up alerts for query time > 500ms
3. **Add More Countries**: Seed data for more countries
4. **Real-Time Updates**: Implement WebSocket for live chart updates
5. **Analytics Dashboard**: Build admin panel showing chart health

---

**Congratulations! Your charts are now blazing fast! 🎉**
