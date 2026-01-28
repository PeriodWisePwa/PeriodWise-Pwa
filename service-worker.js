const CACHE_NAME = "periodwise-cache-v11"; // bump version

const urlsToCache = [
  "/PeriodWise-Pwa/",
  "/PeriodWise-Pwa/index.html",
  "/PeriodWise-Pwa/manifest.json"
];

// Install
self.addEventListener("install", event => {
  self.skipWaiting(); // 🔥 FORCE new SW to activate
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim()) // 🔥 TAKE CONTROL
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
