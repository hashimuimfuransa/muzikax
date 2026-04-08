# Google OAuth Connection Timeout Fix

## Problem
Google login is failing with `ConnectTimeoutError` when trying to reach `oauth2.googleapis.com:443`.

## Root Cause
Your backend server cannot establish a connection to Google's OAuth servers. This is typically caused by:
- Firewall blocking outbound HTTPS connections
- Corporate network restrictions
- DNS resolution issues
- Missing proxy configuration

## Solutions Applied

### 1. Enhanced Error Handling ✅
The code now includes:
- **Retry logic**: Automatically retries failed requests up to 3 times with exponential backoff
- **Custom timeout**: Increased from 10s to 30s
- **Better error messages**: Specific error messages based on the type of network failure
- **Connection agents**: Custom HTTP/HTTPS agents with keep-alive enabled

### 2. What You Need to Do

#### Option A: Check Your Network (Most Common)
1. **Test connectivity** from your terminal:
   ```powershell
   # Test if you can reach Google
   Test-NetConnection oauth2.googleapis.com -Port 443
   
   # Or use curl
   curl https://oauth2.googleapis.com
   ```

2. **If blocked**, try:
   - Temporarily disable Windows Firewall
   - Check if you're on a corporate VPN/proxy
   - Try a different network (mobile hotspot, home WiFi)

#### Option B: Configure Proxy (If Behind Corporate Firewall)
If you're behind a corporate proxy, add these to your `.env` file:

```env
# Add proxy configuration
HTTP_PROXY=http://your-proxy-server:port
HTTPS_PROXY=http://your-proxy-server:port
NO_PROXY=localhost,127.0.0.1
```

Then update the fetch calls to use the proxy (requires additional setup).

#### Option C: Use Alternative DNS
Sometimes DNS resolution fails. Try changing your DNS:
1. Open Network Settings
2. Change DNS to Google DNS: `8.8.8.8` and `8.8.4.4`
3. Flush DNS cache:
   ```powershell
   ipconfig /flushdns
   ```

#### Option D: Check Antivirus/Firewall
Some antivirus software blocks Node.js outbound connections:
1. Add Node.js to your antivirus whitelist
2. Allow outbound connections on port 443 for Node.js

## Testing

After applying fixes, restart your backend:

```powershell
cd c:\Users\Lenovo\muzikax\backend
npm run dev
```

Then try Google login again. The enhanced error messages will tell you exactly what's wrong.

## Verification Steps

1. **Check console logs** for detailed error messages
2. **Look for retry attempts** in the logs
3. **Verify environment variables** are set correctly:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

## If Still Not Working

Run this diagnostic script to test connectivity:

```javascript
// test-google-connectivity.js
async function testGoogleConnectivity() {
  console.log('Testing Google OAuth connectivity...\n');
  
  try {
    console.log('1. Testing DNS resolution...');
    const dns = require('dns');
    const addresses = await dns.promises.resolve('oauth2.googleapis.com');
    console.log('   ✓ DNS resolved to:', addresses);
    
    console.log('\n2. Testing HTTPS connection...');
    const https = require('https');
    const result = await new Promise((resolve, reject) => {
      const req = https.get('https://oauth2.googleapis.com', (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
    });
    console.log('   ✓ Connection successful, status:', result.statusCode);
    
    console.log('\n✅ Google OAuth servers are reachable!');
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('\nThis confirms a network issue. Try the solutions above.');
  }
}

testGoogleConnectivity();
```

Run it with:
```powershell
node test-google-connectivity.js
```

## Quick Fixes Summary

| Issue | Solution |
|-------|----------|
| Firewall blocking | Disable firewall temporarily or add exception |
| Corporate proxy | Configure proxy in .env |
| DNS issues | Change to Google DNS (8.8.8.8) |
| Antivirus blocking | Whitelist Node.js |
| Network restrictions | Try different network/mobile hotspot |

## Next Steps

1. Restart your backend server
2. Try Google login again
3. Check the console for improved error messages
4. If still failing, run the diagnostic script above
5. Share the exact error message for further assistance
