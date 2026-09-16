import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSiteUrls } from '../src/lib/siteMetadata.ts';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('custom production origin is propagated to canonical and language URLs', () => {
  const urls = buildSiteUrls('https://oldi-sotdi.uz/', '/');
  assert.equal(urls.canonical, 'https://oldi-sotdi.uz/');
  assert.equal(urls.uz, 'https://oldi-sotdi.uz/');
  assert.equal(urls.ru, 'https://oldi-sotdi.uz/?lang=ru');
  assert.equal(urls.xDefault, 'https://oldi-sotdi.uz/');
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

test('site metadata follows the active host at runtime', () => {
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
