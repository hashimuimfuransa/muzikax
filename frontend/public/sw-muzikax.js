/**
 * MuzikaX Service Worker - Enhanced Offline Mode
 * Caches app shell, API responses, and enables offline music playback
 */

const CACHE_NAME = 'muzikax-v1';
const AUDIO_CACHE_NAME = 'muzikax-audio-v1';
const API_CACHE_NAME = 'muzikax-api-v1';

// App shell files to cache immediately
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.json',
  '/app.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

// Static assets (CSS, JS, images)
const STATIC_ASSETS_REGEX = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/;

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tracks',
  '/api/creators',
  '/api/charts',
  '/api/community/posts'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle audio files differently - cache on demand
  if (isAudioRequest(request)) {
    event.respondWith(handleAudioRequest(request));
    return;
  }

  // Handle API requests - stale while revalidate
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets - cache first, network fallback
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(handleDefaultRequest(request));
});

/**
 * Check if request is for audio file
 */
function isAudioRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.includes('/audio/') ||
    url.pathname.includes('/tracks/') ||
    request.headers.get('Accept')?.includes('audio/*') ||
    false
  );
}

/**
 * Check if request is for API endpoint
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
  return STATIC_ASSETS_REGEX.test(new URL(request.url).pathname);
}

/**
 * Handle audio file requests - cache on demand
 */
async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('[ServiceWorker] Audio served from cache:', request.url);
    return cachedResponse;
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
      console.log('[ServiceWorker] Audio cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Audio fetch failed:', error);
    
    // Return offline placeholder or error response
    return new Response('', {
      status: 404,
      statusText: 'Audio not available offline'
    });
  }
}

/**
 * Handle API requests - stale while revalidate
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('[ServiceWorker] API fetch failed:', error);
      return null;
    });

  // Return cached response immediately, update when network responds
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network response
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Return error response if both fail
  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle static asset requests - cache first
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Static asset fetch failed:', error);
    return new Response('', { status: 404 });
  }
}

/**
 * Handle default requests - network first with cache fallback
 */
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Network request failed, trying cache:', error);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      // Redirect to the React offline page instead of static HTML
      const offlinePage = await cache.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
      // Fallback to offline.html if /offline not cached
      const fallbackOffline = await cache.match('/offline.html');
      if (fallbackOffline) {
        return fallbackOffline;
      }
    }

    return new Response('Offline', { status: 503 });
  }
}

// Message handler for manual cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    cacheAudioFile(event.data.url, event.data.audioData);
  }
  
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    clearAudioCache();
  }
  
  if (event.data && event.data.type === 'PRECACHE_ROUTES') {
    precacheRoutes(event.data.routes);
  }
});

/**
 * Cache audio file from IndexedDB data
 */
async function cacheAudioFile(url, audioData) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const response = new Response(audioData, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'max-age=31536000'
    }
  });
  await cache.put(url, response);
  console.log('[ServiceWorker] Audio manually cached:', url);
}

/**
 * Clear audio cache
 */
async function clearAudioCache() {
  await caches.delete(AUDIO_CACHE_NAME);
  console.log('[ServiceWorker] Audio cache cleared');
}

/**
 * Precache routes for offline browsing
 */
async function precacheRoutes(routes) {
  const cache = await caches.open(CACHE_NAME);
  const promises = routes.map(async (route) => {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response.clone());
      }
    } catch (error) {
      console.warn('[ServiceWorker] Failed to precache route:', route, error);
    }
  });
  await Promise.all(promises);
  console.log('[ServiceWorker] Routes precached:', routes);
}

console.log('[ServiceWorker] Service Worker initialized with enhanced offline support');
