const CACHE = 'oldisotdi-shell-v4';
const APP_SHELL = ['/', '/manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => /^(oldisotti|oldisotdi)-shell-/.test(key) && key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  const navigation = request.mode === 'navigate';
  const assetRequest = url.pathname.startsWith('/assets/');
  const shellRequest = APP_SHELL.includes(url.pathname);

  if (!navigation && !assetRequest && !shellRequest) return;

  if (navigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cachedShell = await cache.match('/');

      const refresh = fetch(request)
        .then(async response => {
          if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
            await cache.put('/', response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cachedShell) {
        event.waitUntil(refresh.then(() => undefined));
        return cachedShell;
      }

      const networkResponse = await refresh;
      return networkResponse || Response.error();
    })());
    return;
  }

  if (assetRequest) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            cache.put(request, copy).then(async () => {
              const keys = await cache.keys();
              const assets = keys.filter(item => new URL(item.url).pathname.startsWith('/assets/'));
              await Promise.all(assets.slice(0, Math.max(0, assets.length - 80)).map(item => cache.delete(item)));
            }).catch(() => {})
          );
        }
        return response;
      } catch {
        return Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) {
      event.waitUntil(
        fetch(request)
          .then(response => (response.ok ? cache.put(request, response.clone()) : undefined))
          .catch(() => undefined)
      );
      return cached;
    }

    try {
      const response = await fetch(request);
      if (response.ok) event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      return response;
    } catch {
      return Response.error();
    }
  })());
});
