const CACHE_NAME = 'kian-kingdom-cache-v1';

const URLS_TO_CACHE = [
  '/', // root - index.html
  '/index.html',
  '/favicon.png',
  // Header background image (your Unsplash photo)
  'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1600&q=80',
  // Google Fonts CSS
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap',
  // Google Fonts font files (Outfit family variants)
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQN1T3Fw.woff2',
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQNQ3Fw.woff2',
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQN13Fw.woff2'
];

// Install event - caching resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME)
              .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content if available, else network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Else fetch from network and cache dynamically (optional)
        return fetch(event.request).then(networkResponse => {
          // Only cache GET requests and same-origin requests here for simplicity
          if (
            event.request.method === 'GET' &&
            event.request.url.startsWith(self.location.origin)
          ) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          } else {
            return networkResponse;
          }
        });
      }).catch(() => {
        // Optional: fallback content when offline & resource not cached
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
