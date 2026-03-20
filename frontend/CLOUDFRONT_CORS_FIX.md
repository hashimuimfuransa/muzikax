# CORS Fix for CloudFront Audio Resources

## Problem Summary

You're experiencing CORS errors when trying to load audio from CloudFront:

```
Access to audio at 'https://d3351zjfgw127l.cloudfront.net/uploads/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Root Cause

1. **CloudFront Configuration**: Your CloudFront distribution is not sending `Access-Control-Allow-Origin` headers
2. **Web Audio API Requirement**: Even with `crossorigin="anonymous"` on the audio element, the server MUST respond with proper CORS headers for Web Audio API to process the audio
3. **Audio Playback vs. Analysis**: The audio may play normally in the browser, but the Web Audio API (AudioContext/AnalyserNode) requires CORS headers to access the audio data

## Solutions

### Solution 1: Configure CloudFront CORS Headers (RECOMMENDED)

Configure your CloudFront distribution to add CORS headers:

#### Option A: Using CloudFront Functions/Lambda@Edge

Create a CloudFront Function that adds CORS headers to responses:

```javascript
function handler(event) {
    var response = event.response;
    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    return response;
}
```

**Steps:**
1. Go to AWS CloudFront Console
2. Select your distribution (`d3351zjfgw127l.cloudfront.net`)
3. Go to "Functions" tab
4. Create a new function with the code above
5. Deploy it to the "Viewer Response" event

#### Option B: Using S3 Bucket CORS (if S3 is the origin)

If your CloudFront origin is an S3 bucket, configure S3 CORS:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
        "ExposeHeaders": []
    }
]
```

**Steps:**
1. Go to S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Click "CORS configuration"
5. Add the CORS configuration above

### Solution 2: Use a Proxy Server (WORKAROUND)

If you can't modify CloudFront immediately, use a proxy:

#### Backend Proxy Route (Add to your Express backend)

Add this to your backend routes:

```typescript
// backend/src/routes/audioProxy.ts
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/proxy-audio', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'Range': req.headers.range || 'bytes=0-'
      }
    });
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Range', response.headers['content-range']);
    
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

export default router;
```

Then update frontend to use the proxy:

```typescript
// In AudioPlayerContext.tsx
const PROXY_URL = process.env.NEXT_PUBLIC_AUDIO_PROXY_URL || 'http://localhost:5000/api/proxy-audio';

const playTrack = (track: Track, ...) => {
  // Use proxy URL instead of direct CloudFront URL
  const audioUrl = track.audioUrl.startsWith('https://d3351zjfgw127l.cloudfront.net')
    ? `${PROXY_URL}?url=${encodeURIComponent(track.audioUrl)}`
    : track.audioUrl;
    
  const audio = new Audio(audioUrl);
  // ... rest of the code
};
```

### Solution 3: Disable CORS for Development Only

For local development only, you can disable Chrome's security:

**⚠️ WARNING: Only for development, never for production!**

Windows PowerShell:
```powershell
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security --disable-site-isolation-trials
```

## Code Changes Applied

I've updated `AudioPlayerContext.tsx` to properly initialize the AudioContext and handle CORS gracefully:

### Changes Made:

1. **Added AudioContext Initialization** (Lines 172-195):
   - Automatically initializes AudioContext when audio element is available
   - Creates AnalyserNode for visualization
   - Includes error handling for CORS restrictions

2. **Enhanced onloadedmetadata Handler** (Lines 509-543):
   - Initializes audio context after metadata loads
   - Attempts to connect audio element to analyser
   - Gracefully handles connection failures due to CORS

3. **Error Handling**:
   - Logs warnings instead of throwing errors when CORS blocks connection
   - Audio playback continues even if visualization fails
   - Provides clear console messages about connection status

## Testing

After applying the CloudFront CORS configuration:

1. **Clear browser cache**: `Ctrl + Shift + Delete`
2. **Hard refresh**: `Ctrl + F5`
3. **Check console**: You should see:
   ```
   ✅ Audio context and analyser initialized
   ✅ Audio context connected successfully
   ```

If CORS is still blocking, you'll see:
```
⚠️ Audio context connection limited: Failed to load because no supported source was found
```

But audio playback should still work normally.

## Verification Steps

1. Open browser DevTools Console
2. Play a track from CloudFront
3. Check for these indicators:
   - ✅ No CORS errors in console
   - ✅ "Audio context connected successfully" message
   - ✅ Audio visualization works (if using MuzikaX Sound Engine)
   - ✅ Track plays without errors

## Production Considerations

For production deployment:

1. **Restrict CORS Origins**: Replace `'*'` with specific domains:
   ```javascript
   response.headers['Access-Control-Allow-Origin'] = 'https://muzikax.com';
   ```

2. **Add Vary Header**: Ensure proper caching:
   ```javascript
   response.headers['Vary'] = 'Origin';
   ```

3. **HTTPS Only**: Ensure all audio URLs use HTTPS in production

4. **CDN Caching**: CORS headers won't affect CDN caching behavior

## Troubleshooting

### Issue: Still getting CORS errors after CloudFront config

**Solution**: Wait 5-10 minutes for CloudFront cache to invalidate, or create invalidation:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Issue: Audio plays but visualization doesn't work

**Cause**: CORS headers missing or incorrect

**Solution**: Verify CloudFront configuration using curl:
```bash
curl -I "https://d3351zjfgw127l.cloudfront.net/uploads/test.mp3"
```

Look for: `Access-Control-Allow-Origin: *`

### Issue: Works in Chrome but not Firefox

**Cause**: Firefox has stricter CORS policies

**Solution**: Ensure your CORS headers include:
- `Access-Control-Allow-Origin` (not `*`, use specific domain)
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Related Files

- `frontend/src/contexts/AudioPlayerContext.tsx` - Updated with AudioContext initialization
- `frontend/src/components/MuzikaXSoundEngine.tsx` - Uses shared AudioContext
- `frontend/CORS_FIX_SOUND_ENGINE.md` - Previous CORS documentation

## Next Steps

1. ✅ **Code changes applied** - AudioPlayerContext.tsx updated
2. ⏳ **Configure CloudFront CORS** - Follow Solution 1 above
3. 🧪 **Test thoroughly** - Verify both playback and visualization
4. 📊 **Monitor logs** - Check for any remaining errors

---

**Status**: Code ready, awaiting CloudFront CORS configuration

**Last Updated**: March 20, 2026
