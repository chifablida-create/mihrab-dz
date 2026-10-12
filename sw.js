self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open('mihrab-dz-v1').then(cache => {
      return cache.match(e.request).then(res => {
        return res || fetch(e.request).then(response => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
