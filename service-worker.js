// ==============================
// PeriodWise Service Worker
// ==============================

const CACHE_NAME ='periodwise-v5'
const urlsToCache = [
  './',
  './index.html',
  './notifications.html',
  './updates.json',
  './manifest.json'
];

// Install - cache essential files
self.addEventListener('install', event => {
  self.skipWaiting(); // activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - network first for updates.json, network fallback for others
self.addEventListener('fetch', event => {
  // Always fetch updates.json fresh
  if (event.request.url.includes('updates.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For all other requests
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
