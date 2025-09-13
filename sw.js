const CACHE_NAME = 'kian-kingdom-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap',
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQN1T3Fw.woff2',
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQNQ3Fw.woff2',
  'https://fonts.gstatic.com/s/outfit/v2/7d0RuB67KNhCeKnRy7yQN13Fw.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => cachedResponse || fetch(event.request).then(networkResponse => {
      if(event.request.method==='GET' && event.request.url.startsWith(self.location.origin)){
        return caches.open(CACHE_NAME).then(cache => { cache.put(event.request, networkResponse.clone()); return networkResponse; });
      } else return networkResponse;
    })).catch(()=>event.request.destination==='document'?caches.match('/index.html'):null)
  );
});
