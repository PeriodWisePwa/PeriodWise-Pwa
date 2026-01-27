const CACHE_NAME = "periodwise-cache-v2";

const urlsToCache = [
  "/",                   // root
  "/index.html",         // main page
  "/manifest.json",      // manifest
  "/service-worker.js"   // service worker itself
  // add more assets if you have images or CSS files
];

// Install event: cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event: respond with cache first, then network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Optional: fallback page if offline and file not cached
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      })
  );
});
