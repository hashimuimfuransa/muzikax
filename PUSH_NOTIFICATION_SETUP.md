# Push Notification Setup Guide

## Overview
This document explains how to set up push notifications for the MuzikaX platform.

## Prerequisites
- Node.js installed
- Web Push library (`web-push` npm package)
- VAPID keys for secure push notifications

## Step 1: Generate VAPID Keys

Run this command to generate your VAPID key pair:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================
Public Key:
BKcN9OqX... (very long string)

Private Key:
fK9mP2qR... (very long string)
=======================================
```

## Step 2: Configure Environment Variables

Add these to your `.env` file in the backend:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

And in your frontend `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

## Step 3: Install Dependencies

In your backend directory:

```bash
npm install web-push
```

## Step 4: Deploy Service Worker

The service worker file `sw-muzikax.js` is already created in the public directory. Make sure it's accessible at `/sw-muzikax.js`.

## Step 5: Test the Setup

1. Start your backend server
2. Visit your frontend in a browser that supports push notifications
3. Check browser console for any errors
4. Look for the notification permission prompt

## Testing Push Notifications

Run the test script:

```bash
node test-notification-system.js
```

## Mobile Device Testing

1. Deploy your app to a HTTPS-enabled server
2. Access it from a mobile browser
3. Accept push notification permissions
4. Trigger a notification from the admin panel or by uploading a track

## Troubleshooting

### Common Issues:

1. **"VAPID keys not configured"**
   - Make sure environment variables are set correctly
   - Restart your servers after changing env vars

2. **"Push notifications not supported"**
   - Ensure you're using HTTPS (required for push notifications)
   - Check browser compatibility (Chrome, Firefox, Edge, Safari)

3. **"Permission denied"**
   - User must manually grant permission
   - Cannot be forced programmatically

4. **Service worker not registering**
   - Check browser console for errors
   - Ensure the service worker file is accessible
   - Clear browser cache and try again

## Notification Types Implemented

1. **Track Deletion** - Sent to artists when their tracks are deleted by admin
2. **New Track Release** - Sent to followers when artists upload new tracks  
3. **Playlist Recommendations** - Sent for personalized "For You" playlists
4. **Admin Messages** - Existing admin-to-user notifications

## Security Notes

- Never expose private VAPID keys in frontend code
- Use HTTPS in production
- Store subscriptions securely in your database
- Implement proper authentication for subscription endpoints

## Browser Support

- Chrome 50+
- Firefox 44+
- Edge 17+
- Safari 16+ (limited support)

For older browsers, the system gracefully falls back to in-app notifications only.