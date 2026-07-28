const CACHE = 'fitplan-v2';
const FILES = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(FILES.map(f => 
        c.add(f).catch(() => console.log('Cache skip:', f))
      ));
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE).then(c => 
      c.match(e.request).then(r => {
        if (r) return r;
        return fetch(e.request).then(res => {
          if (res.status < 400) c.put(e.request, res.clone());
          return res;
        });
      })
    )
  );
});
