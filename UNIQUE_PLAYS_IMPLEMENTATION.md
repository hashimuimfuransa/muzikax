# Unique Plays Tracking Implementation

## Overview

This implementation adds **unique plays** tracking to MuzikaX, allowing you to distinguish between total plays (including repeats) and unique plays (counting each listener only once per day).

## What Was Changed

### 1. Track Model Schema (`backend/src/models/Track.js`)

Added a new field `uniquePlays` to track unique listeners:

```javascript
uniquePlays: {
    type: Number,
    default: 0
}
```

**Fields:**
- `plays`: Total play count (includes all repeats)
- `uniquePlays`: Unique play count (one per listener per day)

### 2. Play Count Logic (`backend/src/controllers/trackController.js`)

Updated the `incrementPlayCount` function to:

1. **Always increment total plays** - Every play counts towards the `plays` field
2. **Check for previous plays today** - Before incrementing `uniquePlays`, check if this listener (by IP or user ID) has already played the track today
3. **Increment uniquePlays conditionally** - Only increment `uniquePlays` if it's the first play from this listener today

**Unique Listener Identification:**
- Authenticated users: Identified by `userId`
- Anonymous users: Identified by IP address
- A listener is considered unique per day (resets at midnight)

### 3. Chart Service (`backend/src/services/chartService.js`)

Updated chart calculations to incorporate unique plays:

- Added `uniquePlaysScore` as a component of the total chart score
- Unique plays contribute 30% of the streams weight (total plays contribute 70%)
- This ensures charts reward both popularity and genuine listener engagement

**Chart Score Breakdown:**
- Streams Score (70% of streams weight): Based on total plays
- Unique Plays Score (30% of streams weight): Based on unique plays
- Unique Listeners Score: Based on daily unique listeners
- Likes, Shares, Playlists, Growth scores remain unchanged

### 4. Migration Script (`backend/migrate_unique_plays.js`)

Backfills the `uniquePlays` field for existing tracks by analyzing historical `PlayHistory` data.

**Usage:**
```bash
cd backend
node migrate_unique_plays.js
```

**What it does:**
- Processes all existing tracks
- Analyzes PlayHistory records
- Calculates unique plays based on historical data (one per unique listener per day)
- Updates the `uniquePlays` field for each track

### 5. Test Script (`backend/test_unique_plays.js`)

Comprehensive test suite to verify the unique plays tracking logic.

**Usage:**
```bash
cd backend
node test_unique_plays.js
```

**Tests cover:**
- Multiple plays from same IP (should count as 1 unique play)
- Plays from different IPs (each counts as unique)
- Multiple plays from same user (should count as 1 unique play)
- Plays from different users (each counts as unique)

## How It Works

### Play Counting Logic

```
When a user plays a track:
1. Increment total plays counter (always)
2. Check PlayHistory for previous plays today from:
   - Same user ID (if authenticated)
   - Same IP address (if anonymous)
3. If no previous play found today:
   - Increment uniquePlays counter
   - Mark as unique listener in DailyStats
4. Record play in PlayHistory with timestamp and IP/user info
```

### Example Scenarios

**Scenario 1: Same User, Multiple Plays**
```
User A plays Track X at 10:00 AM → plays: 1, uniquePlays: 1
User A plays Track X at 2:00 PM  → plays: 2, uniquePlays: 1 (no change)
User A plays Track X at 8:00 PM  → plays: 3, uniquePlays: 1 (no change)
```

**Scenario 2: Different Users, Same Day**
```
User A plays Track X → plays: 1, uniquePlays: 1
User B plays Track X → plays: 2, uniquePlays: 2
User C plays Track X → plays: 3, uniquePlays: 3
```

**Scenario 3: Same IP, Different Days**
```
Day 1 - IP 192.168.1.1 plays Track X → plays: 1, uniquePlays: 1
Day 2 - IP 192.168.1.1 plays Track X → plays: 2, uniquePlays: 2 (new day!)
```

## Database Collections Affected

### Track Collection
- New field: `uniquePlays` (Number)

### PlayHistory Collection
- No changes (already contains necessary data)

### DailyStats Collection
- No changes (already tracks `uniqueListeners`)

### ChartScore Collection
- New field: `uniquePlays` (stored during chart calculation)

## API Response Changes

### GET /api/tracks/:id
Now includes both play counts:
```json
{
  "_id": "...",
  "title": "Song Title",
  "plays": 150,        // Total plays including repeats
  "uniquePlays": 87,   // Unique listeners (one per day)
  "likes": 42,
  ...
}
```

## Running the Migration

**IMPORTANT:** Run the migration script before using the new feature in production.

```bash
# Navigate to backend directory
cd backend

# Run migration
node migrate_unique_plays.js
```

**Expected Output:**
```
🚀 Starting unique plays migration...

✅ Connected to MongoDB

📊 Found 1234 tracks to process
   Processed 50/1234 tracks...
   Processed 100/1234 tracks...
...

✅ Migration completed!
   - Tracks processed: 1200
   - Tracks skipped (no plays): 34
   - Total tracks: 1234

📋 Sample verification:
   "Song Title 1" - Plays: 500, Unique Plays: 342
   "Song Title 2" - Plays: 320, Unique Plays: 198
   ...
```

## Testing

Run the test script to verify the logic:

```bash
cd backend
node test_unique_plays.js
```

**Expected Output:**
```
🚀 Starting unique plays test...

✅ Connected to MongoDB

📝 Creating test track...
   Created track: "Test Unique Plays Track"

🎵 Simulating 5 plays from same IP address...
   ✅ Created 5 play history records from same IP

📊 Analysis Results:
   Total plays recorded: 5
   Expected unique plays: 1 (same IP, same day)
   
...

✅ Test completed successfully!

📋 Summary:
   - Same IP playing multiple times on same day = 1 unique play
   - Different IPs on same day = each counts as unique play
   - Same user playing multiple times on same day = 1 unique play
   - Different users on same day = each counts as unique play
```

## Performance Considerations

### Indexes
The existing indexes on `PlayHistory` should suffice, but consider adding:

```javascript
// Composite index for efficient unique play queries
PlayHistorySchema.index({ trackId: 1, timestamp: 1, userId: 1 });
PlayHistorySchema.index({ trackId: 1, timestamp: 1, ipAddress: 1 });
```

### Query Optimization
The unique play check happens during play count increment, which is on the critical path. The query is optimized by:
- Only checking today's plays (date range query)
- Using indexed fields (trackId, timestamp)
- Sorting by timestamp descending (most recent first)

## Benefits

1. **Better Analytics**: Distinguish between viral content (many repeats) vs. broad appeal (many unique listeners)
2. **Fairer Charts**: Rewards tracks with genuine listener engagement over repetitive plays
3. **Fraud Prevention**: Makes play manipulation harder (need unique IPs/users, not just repeats)
4. **Creator Insights**: Helps creators understand their true audience size

## Backwards Compatibility

✅ **Fully backwards compatible**
- Existing `plays` field continues to work as before
- New `uniquePlays` field defaults to 0 for old tracks until migration
- Old API responses still work (just add new field)
- Frontend can adopt new field gradually

## Troubleshooting

### Issue: uniquePlays not incrementing

**Check:**
1. Is PlayHistory being created correctly?
2. Are IP addresses being captured?
3. Is the date comparison working (midnight reset)?

### Issue: Migration script fails

**Solutions:**
1. Ensure MongoDB connection string is correct in `.env`
2. Check that PlayHistory collection has data
3. Verify sufficient memory for large datasets (processes in batches)

### Issue: Performance degradation

**Solutions:**
1. Add database indexes on PlayHistory (see Performance section)
2. Run migration during low-traffic periods
3. Consider caching unique play counts in Redis

## Next Steps

1. ✅ Run migration script: `node migrate_unique_plays.js`
2. ✅ Run tests: `node test_unique_plays.js`
3. ✅ Monitor logs for any issues
4. ✅ Update frontend to display both metrics (optional)
5. ✅ Update analytics dashboards (optional)

## Questions?

Refer to the code comments in:
- `backend/src/controllers/trackController.js` - Play counting logic
- `backend/src/services/chartService.js` - Chart calculations
- `backend/migrate_unique_plays.js` - Migration details
- `backend/test_unique_plays.js` - Test scenarios

---

**Implementation Date**: March 24, 2026
**Status**: ✅ Complete and ready for deployment
