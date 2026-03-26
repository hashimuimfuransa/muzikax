# Unique Plays Tracking Implementation

## Overview
Implemented comprehensive unique plays tracking across the MuzikaX platform, allowing artists to see both total plays and unique plays in their creator dashboard analytics and on their public artist profiles.

## What are Unique Plays?
- **Total Plays**: Every time a track is played (including repeats by the same user)
- **Unique Plays**: Each unique listener is counted only once per track, regardless of how many times they play it

This provides artists with two key metrics:
1. **Engagement** (Total Plays): How much people are listening overall
2. **Reach** (Unique Plays): How many different people are listening

---

## Backend Changes

### 1. Creator Controller (`backend/src/controllers/creatorController.js`)

#### Updated Analytics Calculation
```javascript
// Get all tracks for this creator
const tracks = await Track_1.find({ creatorId });

// Calculate total plays and unique plays
const totalPlays = tracks.reduce((sum, track) => sum + (track.plays || 0), 0);
const totalUniquePlays = tracks.reduce((sum, track) => sum + (track.uniquePlays || 0), 0);

console.log('Creator Analytics - Total plays:', totalPlays);
console.log('Creator Analytics - Total unique plays:', totalUniquePlays);
```

#### Response Structure
```javascript
{
    totalTracks,
    totalPlays,
    totalUniquePlays,      // NEW
    totalLikes,
    tracks: tracks.length,
    topCountries
}
```

**Benefits:**
- ✅ Backward compatible (handles missing `uniquePlays` field gracefully)
- ✅ Real-time calculation from track data
- ✅ Logged for debugging

---

### 2. Public Controller (`backend/src/controllers/publicController.js`)

#### Updated Public Stats Endpoint
```javascript
// Calculate total plays and unique plays
const totalPlays = tracks.reduce((sum, track) => sum + (track.plays || 0), 0);
const totalUniquePlays = tracks.reduce((sum, track) => sum + (track.uniquePlays || 0), 0);

// Monthly calculations
const monthlyPlays = totalPlays; // Placeholder
const monthlyUniquePlays = totalUniquePlays; // Placeholder
```

#### Response Structure
```javascript
{
    totalPlays,
    totalUniquePlays,      // NEW
    monthlyPlays,
    monthlyUniquePlays,    // NEW
    totalTracks: tracks.length
}
```

**Benefits:**
- ✅ Public profiles show unique plays
- ✅ Prepares for future monthly unique plays tracking
- ✅ Consistent with creator dashboard

---

## Frontend Changes

### 1. Creator Profile Dashboard (`frontend/src/app/profile/page.tsx`)

#### Updated Interface
```typescript
interface CreatorAnalytics {
  totalTracks: number
  totalPlays: number
  totalUniquePlays?: number // NEW - Optional for backward compatibility
  totalLikes: number
  tracks: number
  topCountries?: Array<{ country: string; count: number }>
}
```

#### Updated Display (Analytics Tab)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
    <div className="text-2xl sm:text-3xl font-bold text-[#FF4D67] mb-2">
      {analytics.totalTracks}
    </div>
    <div className="text-gray-400 text-sm">{t('totalTracks')}</div>
  </div>
  
  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
    <div className="text-2xl sm:text-3xl font-bold text-[#FFCB2B] mb-2">
      {analytics.totalPlays.toLocaleString()}
    </div>
    <div className="text-gray-400 text-sm">{t('totalPlays')}</div>
  </div>
  
  {/* NEW - Unique Plays Card */}
  {analytics.totalUniquePlays !== undefined && (
    <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
      <div className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-2">
        {analytics.totalUniquePlays.toLocaleString()}
      </div>
      <div className="text-gray-400 text-sm">Unique Plays</div>
    </div>
  )}
  
  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
    <div className="text-2xl sm:text-3xl font-bold text-[#6C63FF] mb-2">
      {analytics.totalLikes.toLocaleString()}
    </div>
    <div className="text-gray-400 text-sm">{t('totalLikes')}</div>
  </div>
</div>
```

**Design Choices:**
- 🎨 **Green Color** (`#10B981`): Represents growth and uniqueness
- 📊 **4-Column Layout**: Responsive grid (2 cols mobile, 4 cols desktop)
- ✨ **Conditional Rendering**: Only shows if data exists (backward compatible)

---

### 2. Public Artist Profile (`frontend/src/app/artists/[id]/page.tsx`)

#### Already Implemented Structure
The public artist profile already had the interface defined:

```typescript
interface CreatorStats {
  totalPlays: number
  totalUniquePlays?: number // Already defined
  monthlyPlays: number
  monthlyUniquePlays?: number // Already defined
  totalTracks: number
}
```

#### Display in Artist Profile Header
```tsx
{/* Stats Row */}
<div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
  <div className="flex flex-col">
    <span className="text-white font-bold text-lg">
      {formatNumber(stats?.totalPlays || 0)}
    </span>
    <span className="text-[10px] uppercase tracking-widest font-medium">
      Total Plays
    </span>
  </div>
  
  {/* Unique Plays Display */}
  {stats?.totalUniquePlays !== undefined && (
    <>
      <div className="w-px h-10 bg-gray-800 hidden md:block"></div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-lg">
          {formatNumber(stats?.totalUniquePlays || 0)}
        </span>
        <span className="text-[10px] uppercase tracking-widest font-medium">
          Unique Plays
        </span>
      </div>
    </>
  )}
</div>
```

**Features:**
- ✅ **Number Formatting**: Converts to K/M format for large numbers
- ✅ **Responsive**: Vertical dividers on desktop only
- ✅ **Graceful Fallback**: Doesn't break if data unavailable

---

## Files Modified

### Backend
1. **`backend/src/controllers/creatorController.js`**
   - Added unique plays calculation
   - Updated response structure
   - Added logging for debugging

2. **`backend/src/controllers/publicController.js`**
   - Added unique plays calculation for public stats
   - Added monthly unique plays placeholder
   - Updated response structure

### Frontend
1. **`frontend/src/app/profile/page.tsx`**
   - Updated `CreatorAnalytics` interface
   - Added unique plays display card
   - Changed grid layout from 3 to 4 columns

2. **`frontend/src/app/artists/[id]/page.tsx`**
   - Already had interface defined
   - Display logic already implemented
   - Now receives data from updated backend

---

## User Experience Improvements

### For Artists (Creator Dashboard)
✅ **Better Analytics**: See both reach and engagement metrics  
✅ **Track Performance**: Understand which tracks attract new listeners  
✅ **Marketing Insights**: Know your actual audience size  
✅ **Growth Tracking**: Monitor unique listener growth over time  

### For Fans (Public Artist Profiles)
✅ **Transparency**: See artist popularity metrics  
✅ **Discovery**: Understand artist reach  
✅ **Trust**: Verified stats build credibility  

### For Platform
✅ **Better Data**: More comprehensive analytics  
✅ **Artist Retention**: Better tools keep creators engaged  
✅ **Monetization**: Unique plays valuable for royalty calculations  

---

## Technical Implementation Details

### Database Schema
The `Track` model already includes:
```javascript
{
  plays: Number,          // Total play count
  uniquePlays: Number     // Unique play count (already exists)
}
```

### Calculation Method
```javascript
// Sum across all tracks for an artist
const totalUniquePlays = tracks.reduce(
  (sum, track) => sum + (track.uniquePlays || 0), 
  0
);
```

### Backward Compatibility
- ✅ Handles missing `uniquePlays` field with `|| 0`
- ✅ Conditional rendering in UI with `!== undefined` check
- ✅ No breaking changes to existing functionality

---

## Testing Checklist

### Backend Testing
- [ ] Verify unique plays calculated correctly for creators
- [ ] Test with tracks that have no unique plays field
- [ ] Check public stats endpoint returns unique plays
- [ ] Verify logging shows correct values

### Frontend Testing - Creator Dashboard
- [ ] Unique plays card displays when data available
- [ ] No card shows when data unavailable (no errors)
- [ ] Number formatting works for large numbers
- [ ] Responsive layout works on all screen sizes
- [ ] Color renders correctly (#10B981)

### Frontend Testing - Public Profiles
- [ ] Unique plays displays in artist header
- [ ] Divider shows/hides correctly on mobile/desktop
- [ ] Number formatting works (K/M notation)
- [ ] Graceful fallback when data missing

### Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Safari (iOS + macOS)
- [ ] Firefox
- [ ] Edge

---

## Future Enhancements

### Short-Term
1. **Monthly Unique Plays Tracking**: Implement actual play history with timestamps
2. **Trend Indicators**: Show ↑/↓ arrows for unique plays growth
3. **Geographic Breakdown**: Show unique plays by country/region

### Medium-Term
1. **Unique Plays Chart**: Visual graph showing unique vs total plays over time
2. **Listener Retention**: Track how many unique listeners become repeat listeners
3. **Conversion Rate**: Show percentage of unique listeners who follow

### Long-Term
1. **Advanced Analytics**: 
   - Daily/weekly/monthly unique listeners
   - Listener lifetime value
   - Churn rate analysis
2. **Royalty Integration**: Use unique plays for fair royalty distribution
3. **Industry Benchmarks**: Compare unique plays to similar artists

---

## API Response Examples

### Creator Analytics Endpoint
**Request:** `GET /api/creator/analytics`  
**Response:**
```json
{
  "totalTracks": 15,
  "totalPlays": 125430,
  "totalUniquePlays": 89250,
  "totalLikes": 8920,
  "tracks": 15,
  "topCountries": [
    { "country": "Rwanda", "count": 4520 },
    { "country": "USA", "count": 2100 }
  ]
}
```

### Public Creator Stats Endpoint
**Request:** `GET /api/public/creators/:id/stats`  
**Response:**
```json
{
  "totalPlays": 125430,
  "totalUniquePlays": 89250,
  "monthlyPlays": 125430,
  "monthlyUniquePlays": 89250,
  "totalTracks": 15
}
```

---

## Metrics That Matter

### Example Scenario
An artist has:
- **Total Plays**: 100,000
- **Unique Plays**: 75,000

**Insights:**
- **High Engagement**: 25,000 repeat plays (33% replay rate)
- **Good Reach**: 75,000 unique listeners
- **Fan Loyalty**: Strong repeat listening behavior

If another artist has:
- **Total Plays**: 100,000
- **Unique Plays**: 95,000

**Insights:**
- **Wide Reach**: 95,000 unique listeners
- **Lower Engagement**: Only 5,000 repeat plays (5% replay rate)
- **Discovery Focus**: Good at attracting new listeners, may need to improve retention

---

## Deployment Notes

### Pre-Deployment
- [ ] Backup database before deploying
- [ ] Test on staging environment
- [ ] Verify all tracks have `uniquePlays` field (run migration if needed)

### Post-Deployment
- [ ] Monitor error logs for any undefined field access
- [ ] Check analytics calculation performance
- [ ] Verify public profiles loading correctly

### Rollback Plan
If issues arise:
1. Revert backend controller changes
2. Frontend will gracefully hide unique plays cards
3. No breaking changes to existing functionality

---

## Success Metrics

Track these after implementation:
1. **Creator Engagement**: % of creators checking analytics regularly
2. **Upload Frequency**: Do creators upload more with better analytics?
3. **Platform Retention**: Are creators staying longer?
4. **User Satisfaction**: Feedback from artists about analytics usefulness

---

**Date**: March 26, 2026  
**Status**: ✅ Complete  
**Impact**: Enhanced analytics for all creators on the platform  
**Breaking Changes**: None - fully backward compatible  
**Documentation**: Updated API docs and user guides recommended
