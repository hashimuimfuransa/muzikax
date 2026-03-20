# New Releases Horizontal Scroll Fix - Newest Tracks First

## Problem
The New Releases horizontal scroll section on the home page was showing old tracks instead of the newest tracks first. The backend was sorting trending tracks by popularity (plays) first, then by creation date, causing older popular tracks to appear before newer ones.

## Solution
Modified both backend and frontend to properly sort tracks by creation date (newest first) for the New Releases section.

## Changes Made

### 1. Backend - `backend/src/controllers/trackController.js`
**File**: `c:\Users\Lenovo\muzikax\backend\src\controllers\trackController.js`

- **Modified `getTrendingTracks` function** (lines 723-760)
  - Added `sortBy` query parameter support
  - Implemented dynamic sorting based on parameter:
    - `'newest'` or `'recent'`: Sorts by `createdAt: -1` (newest first)
    - `'likes'`: Sorts by `likes: -1, createdAt: -1`
    - Default (`'plays'`): Sorts by `plays: -1, createdAt: -1`
  
**Before**:
```javascript
const query = Track_1.find({
    type: { $nin: ['beat', 'BEAT', 'Beat', 'beta', 'BETA', 'Beta'] }
})
.sort({ plays: -1, createdAt: -1 });
```

**After**:
```javascript
const sortBy = req.query['sortBy'] || 'plays';
let sortOptions = {};
if (sortBy === 'newest' || sortBy === 'recent') {
    sortOptions = { createdAt: -1 };
} else if (sortBy === 'likes') {
    sortOptions = { likes: -1, createdAt: -1 };
} else {
    sortOptions = { plays: -1, createdAt: -1 };
}

const query = Track_1.find({
    type: { $nin: ['beat', 'BEAT', 'Beat', 'beta', 'BETA', 'Beta'] }
})
.sort(sortOptions);
```

### 2. Frontend Service - `frontend/src/services/trackService.ts`
**File**: `c:\Users\Lenovo\muzikax\frontend\src\services\trackService.ts`

- **Updated `fetchTrendingTracks` function** (lines 149-171)
  - Added optional `sortBy` parameter with types: `'plays' | 'likes' | 'newest' | 'recent'`
  - Appends `sortBy` query parameter to API URL when specified

**Before**:
```typescript
export const fetchTrendingTracks = async (limit: number = 10): Promise<ITrack[]> => {
  try {
    const url = limit > 0 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/trending?limit=${limit}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/trending?limit=0`;
```

**After**:
```typescript
export const fetchTrendingTracks = async (limit: number = 10, sortBy?: 'plays' | 'likes' | 'newest' | 'recent'): Promise<ITrack[]> => {
  try {
    let url = limit > 0 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/trending?limit=${limit}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/trending?limit=0`;
    
    // Add sortBy parameter if specified
    if (sortBy) {
      url += `&sortBy=${sortBy}`;
    }
```

### 3. Frontend Service (JS) - `frontend/src/services/trackService.js`
**File**: `c:\Users\Lenovo\muzikax\frontend\src\services\trackService.js`

- **Updated `fetchTrendingTracks` function** (lines 114-131)
  - Added optional `sortBy` parameter
  - Appends `sortBy` query parameter to API URL when specified

### 4. Frontend Hook - `frontend/src/hooks/useTracks.ts`
**File**: `c:\Users\Lenovo\muzikax\frontend\src\hooks\useTracks.ts`

- **Updated `useTrendingTracks` hook** (lines 48-82)
  - Added optional `sortBy` parameter
  - Passes `sortBy` to `fetchTrendingTracks`
  - Added `sortBy` to useEffect dependencies

**Before**:
```typescript
export const useTrendingTracks = (limit: number = 10, page: number = 1): UseTracksResult => {
  // ...
  const trendingTracks = await fetchTrendingTracks(limit);
  // ...
  useEffect(() => {
    fetchTracks();
  }, [limit, page]);
```

**After**:
```typescript
export const useTrendingTracks = (limit: number = 10, page: number = 1, sortBy?: 'plays' | 'likes' | 'newest' | 'recent'): UseTracksResult => {
  // ...
  const trendingTracks = await fetchTrendingTracks(limit, sortBy);
  // ...
  useEffect(() => {
    fetchTracks();
  }, [limit, page, sortBy]);
```

### 5. Frontend Hook (JS) - `frontend/src/hooks/useTracks.js`
**File**: `c:\Users\Lenovo\muzikax\frontend\src\hooks\useTracks.js`

- **Updated `useTrendingTracks` hook** (lines 27-57)
  - Added optional `sortBy` parameter
  - Now calls `fetchTrendingTracks` instead of `fetchAllTracks` directly
  - Added `sortBy` to useEffect dependencies

### 6. Home Page - `frontend/src/app/page.tsx`
**File**: `c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx`

- **Updated `useTrendingTracks` call** (line 205)
  - Now fetches tracks sorted by newest first
  
**Before**:
```typescript
const { tracks: trendingTracksData, loading: trendingLoading, refresh: refreshTrendingTracks, total: totalTracks, pages: totalPages } =
  useTrendingTracks(50, page); // Load 50 tracks per page to ensure enough songs after filtering out beats
```

**After**:
```typescript
const { tracks: trendingTracksData, loading: trendingLoading, refresh: refreshTrendingTracks, total: totalTracks, pages: totalPages } =
  useTrendingTracks(50, page, 'newest'); // Load 50 tracks per page sorted by newest to ensure enough songs after filtering out beats
```

- **Simplified `newReleases` useMemo** (lines 643-656)
  - Removed manual array reversal since backend now returns newest first
  - Tracks are already sorted by creation date from the API

**Before**:
```typescript
const newReleases: Track[] = useMemo(() => {
  const songTracks = trendingTracks.filter(track => 
    track.type === 'song' || track.category === 'song'
  );
  
  // Since we don't have explicit date information in the Track interface,
  // we'll reverse the order to show newest tracks first (assuming last in array are newest)
  const reversedTracks = [...songTracks].reverse();
  const uniqueSortedTracks = removeDuplicateTracks(reversedTracks);
  return uniqueSortedTracks.slice(0, 10);
}, [trendingTracks]);
```

**After**:
```typescript
const newReleases: Track[] = useMemo(() => {
  // Filter to only include song type tracks
  const songTracks = trendingTracks.filter(track => 
    track.type === 'song' || track.category === 'song'
  );
  
  // Tracks are already sorted by newest from the backend (createdAt: -1)
  // Just remove duplicates and take the first 10
  const uniqueSortedTracks = removeDuplicateTracks(songTracks);
  return uniqueSortedTracks.slice(0, 10);
}, [trendingTracks]);
```

## How It Works

1. **Backend API Enhancement**: The `/api/tracks/trending` endpoint now accepts a `sortBy` query parameter that allows clients to specify how tracks should be sorted.

2. **Frontend Data Fetching**: When the home page loads, it requests trending tracks with `sortBy='newest'`, ensuring the API returns tracks sorted by creation date (newest first).

3. **New Releases Section**: The `newReleases` useMemo hook filters these pre-sorted tracks to show only songs (not beats/mixes), removes duplicates, and displays the first 10 newest tracks.

## API Usage Examples

```bash
# Get trending tracks sorted by newest (default for New Releases section)
GET /api/tracks/trending?limit=50&sortBy=newest

# Get trending tracks sorted by popularity (default behavior)
GET /api/tracks/trending?limit=50&sortBy=plays

# Get trending tracks sorted by likes
GET /api/tracks/trending?limit=50&sortBy=likes

# Get trending tracks sorted by recent (alias for newest)
GET /api/tracks/trending?limit=50&sortBy=recent
```

## Benefits

1. **Fast New Track Discovery**: Newest tracks now appear immediately in the New Releases section
2. **Flexible Sorting**: Other sections can still use different sorting strategies (popularity, likes, etc.)
3. **Backend-Controlled Sorting**: More efficient than client-side sorting, especially with pagination
4. **Consistent Behavior**: All track fetching logic is now centralized in the backend
5. **Type Safety**: TypeScript enums ensure valid sort options are used

## Testing

To verify the fix works:

1. Start the backend server
2. Start the frontend development server
3. Navigate to the home page
4. Check the "New Releases" horizontal scroll section
5. Verify that the tracks shown are the most recently uploaded tracks
6. Compare upload dates to confirm newest tracks appear first

## Files Modified

- ✅ `backend/src/controllers/trackController.js`
- ✅ `frontend/src/services/trackService.ts`
- ✅ `frontend/src/services/trackService.js`
- ✅ `frontend/src/hooks/useTracks.ts`
- ✅ `frontend/src/hooks/useTracks.js`
- ✅ `frontend/src/app/page.tsx`

## Date
March 20, 2026
