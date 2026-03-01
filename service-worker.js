const CACHE_NAME = 'periodwise-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/lock.html
  '/styles.css',
  '/script.js',
  '/images/logo.png', // Add all static assets like images, icons here
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('Service Worker: Activated');
});

// Intercept fetch requests and serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If a match is found in the cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from the network
      return fetch(event.request);
    })
  );
});
