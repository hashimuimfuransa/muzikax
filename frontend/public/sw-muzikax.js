// Service Worker for Push Notifications
const CACHE_NAME = 'muzikax-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push notification received
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  const data = event.data.json();
  console.log('Push data:', data);

  const title = data.title || 'MuzikaX Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/android-chrome-192x192.png',
    badge: data.badge || '/favicon-32x32.png',
    data: data.data || {},
    timestamp: data.timestamp || Date.now(),
    tag: data.tag || 'muzikax-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification clicked
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Handle notification click based on data
  const notificationData = event.notification.data;
  let url = '/';

  if (notificationData) {
    switch (notificationData.notificationType) {
      case 'track_deleted':
        url = '/profile';
        break;
      case 'new_track':
        url = `/tracks/${notificationData.trackId}`;
        break;
      case 'playlist_recommendation':
        url = `/playlists/${notificationData.playlistId}`;
        break;
      case 'reply':
        url = '/notifications';
        break;
      default:
        url = '/notifications';
    }
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', event => {
  console.log('Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    })
    .then(newSubscription => {
      // Send new subscription to server
      return fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: newSubscription
        })
      });
    })
  );
});

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}