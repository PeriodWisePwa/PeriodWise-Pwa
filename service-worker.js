const CACHE_NAME = "periodwise-cache-v27";  // Update cache version number

// List of files to cache (including updates.json)
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./updates.json",  // Make sure updates.json is cached
  // You can add more assets here if needed
];

// Install: Cache static files
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: Remove old caches
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
    )
  );
  self.clients.claim();
});

// Fetch: Network-first for updates.json
self.addEventListener("fetch", event => {
  if (event.request.url.includes("updates.json")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })  // No cache for updates.json
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))  // Use cached version if offline
    );
    return;
  }

  // Default fetch: Try network first, then fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))  // Use cached version if offline
  );
});
