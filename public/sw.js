// Service Worker for Offline Support
// Version incremented to force cache invalidation
const CACHE_VERSION = 3;
const CACHE_NAME = `salespro-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `salespro-runtime-v${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// URLs/patterns that should NEVER be cached (to avoid React version conflicts)
const NEVER_CACHE_PATTERNS = [
  '/node_modules/',
  '/.vite/',
  '/src/',
  '.tsx',
  '.ts',
  'chunk-',
  '@radix-ui',
  '@tanstack',
  'react',
  'framer-motion',
];

// Check if a URL should be cached
function shouldCache(url) {
  const urlString = url.toString();
  
  // Never cache Vite dev server files or React-related chunks
  for (const pattern of NEVER_CACHE_PATTERNS) {
    if (urlString.includes(pattern)) {
      return false;
    }
  }
  
  // Only cache static assets
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => urlString.endsWith(ext));
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL old caches to ensure clean state
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.info('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // For development: always go to network first for JS/TS files
  if (url.pathname.includes('.js') || url.pathname.includes('.ts') || url.pathname.includes('.mjs')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Only fallback to cache for critical files
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // API requests - Network only (no caching)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets that are safe to cache
  if (shouldCache(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html')))
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const cache = await caches.open('offline-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          const data = await cachedResponse.json();
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: JSON.stringify(data.body),
          });
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Listen for messages to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
