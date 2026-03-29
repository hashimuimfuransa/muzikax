# Offline Mode with Local Audio Player - Complete Guide

## Overview

MuzikaX now includes an enhanced offline mode that allows users to:
1. **Play downloaded tracks** from IndexedDB storage
2. **Upload and play local audio files** from their device when no downloads are available
3. **Access a dedicated offline page** instead of being redirected to home
4. **Seamless offline detection** with smart routing

## Features Implemented

### 1. Dedicated Offline Page (`/offline`)

**Location:** `frontend/src/app/offline/page.tsx`

A fully-featured React page that serves as the offline hub:
- ✅ Shows offline status with visual indicators
- ✅ Displays downloaded tracks count
- ✅ **Local file uploader** for playing music from device
- ✅ Built-in audio player for local files
- ✅ Support for MP3, WAV, OGG, M4A formats
- ✅ File management (add/remove tracks)
- ✅ Quick access to downloaded tracks
- ✅ Link back to main app

**Key Features:**
```tsx
- Upload multiple audio files from computer/phone
- Play/pause/stop controls
- Visual feedback for current track
- File size display
- Remove files from playlist
- Drag-and-drop ready UI
```

### 2. Enhanced Offline Context

**Location:** `frontend/src/contexts/OfflineContext.tsx`

Manages offline state and track storage:
- Real-time online/offline detection
- IndexedDB integration for persistent storage
- Track download/upload management
- Favorite toggling
- Storage statistics

### 3. Smart Offline Routing

**Location:** `frontend/src/hooks/useOfflineRouting.ts`

Intelligent routing that:
- ✅ **Prevents redirect to home page** when offline
- ✅ Suggests offline page when no downloads available
- ✅ Allows access to essential pages (player, tracks, upload)
- ✅ Doesn't interrupt user workflow

### 4. Updated Offline Indicator

**Location:** `frontend/src/components/OfflineIndicator.tsx`

Enhanced banner with:
- Persistent status bar showing connection state
- Temporary notification toast on status change
- **"Open Local Player" button** when offline with no downloads
- Direct link to `/offline` page
- Available track count display

### 5. Service Worker Updates

**Location:** `frontend/public/sw-muzikax.js`

Updated to:
- Cache the `/offline` route for immediate access
- Redirect navigation requests to offline page when offline
- Support local audio file playback
- Maintain existing audio caching functionality

## How It Works

### User Flow When Going Offline

#### Scenario 1: User Has Downloaded Tracks
1. User loses internet connection
2. Offline indicator appears at top (orange banner)
3. Toast notification shows: "You're offline - Downloaded tracks are available"
4. User can continue browsing
5. Downloaded tracks still playable from IndexedDB
6. No redirect to home page

#### Scenario 2: User Has NO Downloaded Tracks
1. User loses internet connection
2. Offline indicator appears with button: "Open Local Player"
3. Toast notification: "You're offline - Open local player" with "Open Now →" link
4. User clicks button/link to go to `/offline` page
5. On offline page, user can:
   - Upload audio files from their device
   - Play them immediately in the built-in player
   - Manage uploaded files
   - See file sizes and names

### Local File Upload Process

```
1. User clicks "Add Files" button or drag-drop area
2. File picker opens (supports multi-select)
3. User selects audio files from device
4. Files appear in the upload list
5. Click play button on any file to start playback
6. Audio plays in the embedded player
7. Can remove files anytime with X button
```

### Supported Audio Formats

The local player supports:
- **MP3** (.mp3) - Most common format
- **WAV** (.wav) - Uncompressed audio
- **OGG** (.ogg) - Open source format
- **M4A** (.m4a) - Apple audio format
- Any format with MIME type `audio/*`

## Technical Implementation

### Key Components

#### OfflinePage Component
```tsx
// State management
const [localFiles, setLocalFiles] = useState<File[]>([]);
const [currentTrack, setCurrentTrack] = useState<File | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

// File handling
handleFileSelect() // Processes uploaded files
playLocalFile()    // Plays selected file
togglePlayPause()  // Toggles playback
removeFile()       // Removes from playlist
```

#### Service Worker Logic
```javascript
// Redirect to offline page when offline
if (request.mode === 'navigate') {
  const offlinePage = await cache.match('/offline');
  if (offlinePage) {
    return offlinePage;
  }
}
```

### Data Flow

```
User Device
    ↓
File Input (HTML)
    ↓
File[] Array
    ↓
URL.createObjectURL(file)
    ↓
<audio> Element
    ↓
Playback Controls
```

## Testing the Feature

### Test Offline Mode

1. **Open DevTools** (F12 or Ctrl+Shift+J)
2. **Go to Network tab**
3. **Check "Offline" box**
4. **Refresh page**

### Expected Behavior

#### With Downloaded Tracks:
- ✅ Orange banner appears: "Offline Mode - X songs available"
- ✅ Toast notification appears
- ✅ Can still navigate app
- ✅ Downloaded tracks playable
- ✅ No redirect to home

#### Without Downloaded Tracks:
- ✅ Orange banner with "Open Local Player" button
- ✅ Toast with "Open Now →" link
- ✅ Clicking takes you to `/offline` page
- ✅ Can upload and play local files
- ✅ No redirect to home

### Test Local File Upload

1. Go offline (see steps above)
2. Click "Open Local Player" or navigate to `/offline`
3. Click "Add Files" button
4. Select audio files from your device
5. Files appear in the list
6. Click play button on any file
7. Audio should play immediately

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Offline Detection | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ |
| Audio Blob Playback | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ❌* | ✅ |

*Safari has limited service worker support

## Storage Considerations

### IndexedDB (Downloaded Tracks)
- Persistent storage
- Survives browser restarts
- Quota varies by browser (typically 50MB+)
- Managed by app

### Memory (Local Files)
- Temporary (session only)
- Cleared on page refresh
- No storage quota
- User-controlled

## Future Enhancements

Potential improvements:
- [ ] Drag-and-drop file upload
- [ ] Playlist creation from local files
- [ ] Local file metadata extraction (ID3 tags)
- [ ] Album art display for local files
- [ ] Shuffle/repeat modes
- [ ] Equalizer for local playback
- [ ] Export local playlist
- [ ] Cache local files in IndexedDB for persistence

## Troubleshooting

### Issue: Offline page not loading
**Solution:** Clear service worker cache and reload
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(names => names.forEach(n => caches.delete(n)));
```

### Issue: Can't play uploaded files
**Solution:** Check file format compatibility
- Ensure file is audio format (MP3, WAV, OGG, M4A)
- Check file isn't corrupted
- Try different browser

### Issue: No offline indicator showing
**Solution:** Check OfflineContext is loaded
- Verify app structure includes `<OfflineProvider>`
- Check navigator.onLine in console
- Look for console errors

## Files Modified/Created

### Created:
- `frontend/src/app/offline/page.tsx` - Main offline page component
- `frontend/src/hooks/useOfflineRouting.ts` - Offline routing hook

### Updated:
- `frontend/src/components/OfflineIndicator.tsx` - Added local player links
- `frontend/public/sw-muzikax.js` - Added offline page caching
- `frontend/src/contexts/OfflineContext.tsx` - Existing (no changes needed)

## Summary

✅ **Users can now play local audio files when offline**
✅ **No more redirect to home page when offline**
✅ **Dedicated offline page with full player functionality**
✅ **Smart detection and suggestions based on downloaded content**
✅ **Seamless user experience whether online or offline**

The system now provides a complete offline music listening experience, whether users have downloaded tracks or want to play files from their device!
