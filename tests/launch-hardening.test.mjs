import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSiteUrls, canonicalSiteOrigin, PRIMARY_SITE_ORIGIN } from '../src/lib/siteMetadata.ts';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('custom production origin is propagated to canonical and language URLs', () => {
  const urls = buildSiteUrls('https://oldi-sotdi.uz/', '/');
  assert.equal(urls.canonical, 'https://oldi-sotdi.uz/');
  assert.equal(urls.uz, 'https://oldi-sotdi.uz/');
  assert.equal(urls.ru, 'https://oldi-sotdi.uz/?lang=ru');
  assert.equal(urls.xDefault, 'https://oldi-sotdi.uz/');
});

test('www and Vercel aliases share one canonical apex', () => {
  assert.equal(PRIMARY_SITE_ORIGIN, 'https://oldi-sotdi.uz');
  assert.equal(canonicalSiteOrigin('https://www.oldi-sotdi.uz/'), PRIMARY_SITE_ORIGIN);
  assert.equal(canonicalSiteOrigin('https://fedyaibragimovich-gif.vercel.app'), PRIMARY_SITE_ORIGIN);
  assert.equal(buildSiteUrls('https://preview-test.vercel.app', '/l/abc').canonical, 'https://oldi-sotdi.uz/l/abc');
  assert.equal(canonicalSiteOrigin('http://localhost:3000'), 'http://localhost:3000');
});

test('HTML served to non-JavaScript crawlers declares the custom domain', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/oldi-sotdi\.uz\/"/);
  assert.match(html, /hreflang="ru" href="https:\/\/oldi-sotdi\.uz\/\?lang=ru"/);
  assert.match(html, /"url":"https:\/\/oldi-sotdi\.uz\/"/);
  assert.doesNotMatch(html, /fedyaibragimovich-gif\.vercel\.app/);
});

test('production monitoring captures global and React failures', () => {
  const monitoring = read('src/lib/monitoring.ts');
  const main = read('src/main.tsx');
  const boundary = read('src/components/ErrorBoundary.tsx');
  const endpoint = read('api/client-error.ts');

  assert.match(monitoring, /addEventListener\('error'/);
  assert.match(monitoring, /addEventListener\('unhandledrejection'/);
  assert.match(monitoring, /\/api\/client-error/);
  assert.match(main, /initializeProductionMonitoring\(\)/);
  assert.match(boundary, /reportClientError/);
  assert.match(endpoint, /oldisotdi_client_error/);
  assert.match(endpoint, /req\.method !== 'POST'/);
});

test('site metadata synchronizes canonical tags at runtime', () => {
  const main = read('src/main.tsx');
  const metadata = read('src/lib/siteMetadata.ts');
  assert.match(main, /syncSiteOriginMetadata\(\)/);
  assert.match(metadata, /window\.location\.origin/);
  assert.match(metadata, /link\[rel="canonical"\]/);
  assert.match(metadata, /hreflang="ru"/);
});

test('listing renderer uses standards-based request URL parsing', () => {
  const renderer = read('api/listing-page.ts');
  assert.match(renderer, /new URL\(/);
  assert.doesNotMatch(renderer, /req\.query\?\.listing/);
});
