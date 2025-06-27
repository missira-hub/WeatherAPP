self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("weather-cache").then((cache) =>
      cache.addAll(["index.html", "script.js", "style.css", "manifest.json", "images/icon-192.png"])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
