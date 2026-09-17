const C="teachflow-clean-v4";

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(C).then(cache => cache.addAll([
      "./",
      "./index.html",
      "./styles.css",
      "./app.js"
    ]))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== C).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith("data.js")) {
    event.respondWith(
      fetch(event.request, {cache:"no-store"})
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy=response.clone();
        caches.open(C).then(cache => cache.put(event.request,copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
