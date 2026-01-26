 const CACHE_NAME = "periodwise-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];
self.addEventListener("install", event => {
  // Cache files for offline use
  event.waitUntil(
    caches.open("periodwise-cache").then(cache => {
      return cache.addAll([
        "/PeriodWise-Pwa/",
        "/PeriodWise-Pwa/index.html",
        "/PeriodWise-Pwa/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  // Serve cached content if offline
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
