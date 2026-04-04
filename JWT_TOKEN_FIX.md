# JWT Token "Invalid Signature" Error - Fix Guide

## Problem
You're seeing this error in the backend logs:
```
Token verification failed: JsonWebTokenError: invalid signature
GET /api/notifications/unread-count 401
```

## Root Cause
The JWT token verification is failing because:
1. **Old tokens** in the browser's localStorage were generated with a **different JWT secret**
2. The current `.env` file has been updated since those tokens were created
3. When the backend tries to verify these old tokens, the cryptographic signature doesn't match

## Quick Fix (Choose One Method)

### Method 1: Clear Browser Storage (Recommended) ⚡
1. Open your browser's Developer Tools (Press `F12`)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In the left sidebar, expand **Local Storage**
4. Click on your frontend URL (e.g., `https://muzikax.vercel.app` or `http://localhost:3000`)
5. Find and delete these keys:
   - `accessToken`
   - `refreshToken`
   - `user`
6. Refresh the page
7. Login again

**OR** use the Console command:
```javascript
// Run this in your browser console (F12 > Console tab)
localStorage.clear()
```

### Method 2: Use Incognito/Private Mode 🕵️
1. Open an Incognito/Private browser window
2. Navigate to your app
3. Login fresh (this will generate new tokens with the current secret)

### Method 3: Clear All Site Data 🧹
1. Press `F12` to open Developer Tools
2. Go to **Application** > **Storage**
3. Click **"Clear site data"** button
4. Refresh the page and login

## Verification Steps

After clearing storage and logging in again:

1. Check the browser console for successful login
2. Verify new tokens are stored in localStorage:
   ```javascript
   // In browser console
   console.log('Access Token:', localStorage.getItem('accessToken'))
   console.log('Refresh Token:', localStorage.getItem('refreshToken'))
   ```

3. The backend logs should show:
   ```
   Token verified successfully, user ID: [user_id]
   ```

## Test Script

A test script has been provided to verify JWT configuration:

```bash
cd backend
node test-jwt-tokens.js
```

This will:
- ✅ Check environment variables
- ✅ Generate test tokens
- ✅ Verify tokens work correctly
- ✅ Confirm the secret key is properly configured

## Prevention

To avoid this issue in the future:

1. **When changing JWT secrets in production:**
   - Notify all users to clear their cache
   - Or implement a token versioning system
   - Consider using a stable secret in production

2. **Best practices:**
   - Store JWT secrets in a secure vault (AWS Secrets Manager, Azure Key Vault, etc.)
   - Don't change production secrets unless necessary
   - Use separate secrets for development and production

## Current Configuration

Your current JWT settings (from `.env`):
```
JWT_ACCESS_SECRET=access_4b8f72d9c1a7e3f5c44a9b28 (31 chars)
JWT_REFRESH_SECRET=refresh_d9e3f7a1b45c9e28fa7b3c884f27 (36 chars)
JWT_ACCESS_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d
```

## Why This Happened

Common scenarios that cause this error:
- ✅ Changed the `.env` file after tokens were already issued
- ✅ Restarted the backend with a new secret
- ✅ Deployed new code with updated environment variables
- ✅ Switched between different branches with different `.env` files

## Additional Debugging

If the problem persists after clearing storage:

1. **Check if backend is reading the correct .env:**
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('Secret:', process.env.JWT_ACCESS_SECRET)"
   ```

2. **Verify backend server restarted:**
   - Make sure you stopped and restarted the backend after changing `.env`
   - Check the process is actually using the new environment

3. **Check for multiple .env files:**
   - Ensure there's no `.env.local`, `.env.production` overriding values
   - Verify Vercel/Render environment variables match

## Contact

If issues persist, check the detailed diagnostic output from:
```bash
node test-jwt-tokens.js
```

---
**Last Updated:** April 3, 2026
**Status:** ✅ Resolved - Clear browser localStorage to fix
