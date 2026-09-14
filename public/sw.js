const CACHE = 'oldisotdi-shell-v3';
const APP_SHELL = ['/', '/manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => /^(oldisotti|oldisotdi)-shell-/.test(key) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  const navigation = request.mode === 'navigate';
  const cacheable = navigation || url.pathname.startsWith('/assets/') || APP_SHELL.includes(url.pathname);
  if (!cacheable) return;
  const key = navigation ? '/' : request;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && (!navigation || response.headers.get('content-type')?.includes('text/html'))) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(async cache => {
        await cache.put(key, copy);
        const keys = await cache.keys();
        const assets = keys.filter(item => new URL(item.url).pathname.startsWith('/assets/'));
        await Promise.all(assets.slice(0, Math.max(0, assets.length - 80)).map(item => cache.delete(item)));
      }).catch(() => {}));
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    // Never return HTML for a JavaScript, CSS or image request.
    return await cache.match(key) || Response.error();
  }));
});
