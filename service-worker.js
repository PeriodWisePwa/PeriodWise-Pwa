self.addEventListener("install", event => {
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
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
