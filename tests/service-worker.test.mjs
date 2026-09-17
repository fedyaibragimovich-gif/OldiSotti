import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile('public/sw.js', 'utf8');

function setup(fetchImpl = async () => { throw new Error('offline'); }) {
  const listeners = {};
  const shell = new Response('<html>offline shell</html>', { headers: { 'content-type': 'text/html' } });
  const store = new Map([['/', shell]]);
  const cache = {
    addAll: async () => {},
    match: async key => store.get(typeof key === 'string' ? key : key.url),
    put: async (key, value) => { store.set(typeof key === 'string' ? key : key.url, value); },
    keys: async () => []
  };

  vm.runInNewContext(source, {
    self: {
      location: { origin: 'https://example.com' },
      addEventListener: (name, fn) => { listeners[name] = fn; },
      skipWaiting: async () => {},
      clients: { claim: async () => {} }
    },
    URL,
    Response,
    fetch: fetchImpl,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true
    }
  });

  return { listeners, shell };
}

function runFetch(listeners, request) {
  let response;
  const background = [];
  listeners.fetch({
    request,
    respondWith: promise => { response = promise; },
    waitUntil: promise => { background.push(Promise.resolve(promise)); }
  });
  return { response, background };
}

test('offline script misses return an error instead of HTML', async () => {
  const { listeners } = setup();
  const { response } = runFetch(listeners, {
    url: 'https://example.com/assets/missing.js',
    method: 'GET',
    mode: 'cors'
  });
  assert.equal((await response).type, 'error');
});

test('offline navigation uses the cached application shell', async () => {
  const { listeners } = setup();
  const { response } = runFetch(listeners, {
    url: 'https://example.com/?listing=phone',
    method: 'GET',
    mode: 'navigate'
  });
  assert.match(await (await response).text(), /offline shell/);
});

test('cached navigation does not wait for a slow network refresh', async () => {
  let releaseNetwork;
  const network = new Promise(resolve => { releaseNetwork = resolve; });
  const { listeners } = setup(() => network);
  const { response } = runFetch(listeners, {
    url: 'https://example.com/',
    method: 'GET',
    mode: 'navigate'
  });

  const served = await Promise.race([
    response,
    new Promise((_, reject) => setTimeout(() => reject(new Error('cached navigation waited for network')), 50))
  ]);
  assert.match(await served.text(), /offline shell/);
  releaseNetwork(new Response('<html>fresh</html>', { headers: { 'content-type': 'text/html' } }));
});

test('API calls bypass the service worker cache', () => {
  const { listeners } = setup();
  let intercepted = false;
  runFetch(listeners, {
    url: 'https://example.com/api/health',
    method: 'GET',
    mode: 'cors'
  }).response?.then(() => { intercepted = true; });
  assert.equal(intercepted, false);
});
