# Country Charts Missing Data - Diagnosis & Solution

## Problem Summary
Location-based charts for Rwanda (RW) are returning **empty data** despite cache invalidation working correctly.

### Symptoms from Logs
```
💾 Cache miss: Fetching from database for RW
GET /api/charts/RW?timeWindow=weekly&limit=50 200 762.194 ms - 122
💾 Cache miss: Fetching from database for RW
GET /api/charts/RW?timeWindow=daily&limit=50 200 518.441 ms - 121
```

- ✅ Cache is being invalidated properly (`♻️ Invalidated 6 cache keys matching: charts:*`)
- ✅ API endpoint is responding (200 OK)
- ❌ Response size is only **122 bytes** (essentially empty)
- ❌ No chart data being returned

## Root Cause

The `getCountryCharts` function in `/backend/src/services/chartService.js` queries the `ListenerGeography` collection to find tracks with listeners in a specific country. If there's **no ListenerGeography data for Rwanda (RW)**, it returns an empty array.

### How Country Charts Work

1. **Data Collection**: When a track is played, the system captures:
   - IP address of the listener
   - Geolocation data (country, region, city) via `geoip.lookup()`
   - Stored in `ListenerGeography` collection

2. **Chart Calculation**: For country charts:
   - Query `ChartScore` for all tracks sorted by score
   - For each track, check `ListenerGeography` for listeners in that country
   - Calculate country-specific score based on plays + unique listeners
   - Return top tracks filtered by country

3. **The Issue**: 
   - No Rwandan IP addresses have played tracks yet
   - OR geoip lookup is failing for Rwandan IPs
   - Result: Empty `ListenerGeography` collection for RW → Empty charts

## Diagnostic Steps

### Step 1: Run Debug Script
```bash
cd backend
node debug-country-charts.js
```

This will check:
- Total `ListenerGeography` records
- Records specifically for Rwanda (RW)
- Countries present in the database
- `ChartScore` data existence
- Sample tracks with plays

### Step 2: Analyze Output
Look for:
- ❌ If `Records for Rwanda (RW): 0` → No listener data
- ❌ If `Total ChartScore records: 0` → No chart calculations
- ✅ If other countries exist but not RW → GeoIP issue

## Solutions

### Solution 1: Seed Test Data (Recommended for Testing)
```bash
cd backend
node seed-country-data.js
```

This will:
- Create sample Rwandan IP addresses
- Generate listener geography records for existing tracks
- Update `ChartScore` with country-specific data
- Make country charts work immediately

### Solution 2: Wait for Real Plays (Production)
In production, country charts will populate naturally as:
1. Users from Rwanda play tracks
2. Their IP addresses are captured
3. `ListenerGeography` records are created
4. Charts automatically include those tracks

### Solution 3: Manual Data Import
If you have historical play data, import it into `ListenerGeography`:
```javascript
// Example structure
{
  trackId: ObjectId("..."),
  creatorId: ObjectId("..."),
  ipAddress: "41.186.4.1",
  country: "RW",
  region: "Kigali",
  city: "Kigali",
  latitude: -1.9536,
  longitude: 30.0606,
  timestamp: new Date()
}
```

## Enhanced Logging

Added detailed logging to track the issue:

### Controller Level (`chartController.js`)
- 🔑 Shows cache key being checked
- 📦 Shows cache hit with track count
- 💾 Shows cache miss
- 📊 Shows database results count
- ⚠️ Warns if no data found with suggestions

### Service Level (`chartService.js`)
- 🌍 Shows country being queried
- 📊 Shows ChartScore documents found
- 🔍 Shows ListenerGeography query
- 📍 Shows total records for country

## Testing After Fix

1. **Start the backend server**
2. **Clear cache** (automatic on restart or via invalidation)
3. **Request country charts**:
   ```bash
   curl http://localhost:5000/api/charts/RW?timeWindow=weekly&limit=50
   ```
4. **Check response**:
   - Should return substantial JSON (>122 bytes)
   - Should contain `charts` array with tracks
   - Each track should have `countryScore`, `countryPlays`, etc.

## File Changes Made

### Created Files
1. `debug-country-charts.js` - Diagnostic script
2. `seed-country-data.js` - Data seeding script
3. `COUNTRY_CHARTS_FIX.md` - This documentation

### Modified Files
1. `src/controllers/chartController.js` - Enhanced logging
2. `src/services/chartService.js` - Enhanced logging

## Prevention

To ensure country charts work for all countries:

1. **Enable GeoIP**: Ensure `maxmind-geoip` or similar is properly configured
2. **Collect Data**: Let users play tracks from various countries
3. **Regular Updates**: Run chart calculation job periodically
4. **Monitor**: Watch logs for countries with zero data

## Additional Notes

### Cache Behavior
- Cache TTL: 1 hour for country charts
- Cache key format: `charts:country:RW:weekly:50`
- Cache invalidation: Works correctly (`charts:*` pattern)
- Cache miss → Database query → Cache set → Return data

### Performance Considerations
- First request after cache invalidation: ~500-800ms (database query)
- Cached requests: ~10-25ms (Redis/Upstash)
- Aggregation queries on `ListenerGeography` can be slow without indexes

### Indexes Required
Ensure these indexes exist on `ListenerGeography`:
```javascript
{ trackId: 1 }
{ creatorId: 1 }
{ country: 1 }
{ timestamp: -1 }
```

## Next Steps

1. ✅ Run `node debug-country-charts.js` to diagnose
2. ✅ Run `node seed-country-data.js` to populate test data
3. ✅ Test the endpoint: `/api/charts/RW`
4. ✅ Monitor logs for detailed execution flow
5. ✅ Verify charts display in frontend

## Support

If issues persist after running seed script:
1. Check MongoDB connection
2. Verify `.env` has correct database URI
3. Ensure tracks exist in database
4. Check for any console errors in the debug output
