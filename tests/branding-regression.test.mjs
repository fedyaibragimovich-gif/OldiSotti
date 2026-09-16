import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('new listing IDs are OldiSotdi-native', async () => {
  const source = await readFile('src/components/PostAdModal.tsx', 'utf8');
  assert.match(source, /const listingId = `oldisotdi-\$\{crypto\.randomUUID\(\)\}`/);
  assert.doesNotMatch(source, /const listingId = `olx-/i);
});

test('Telegram share helpers use canonical branded listing routes', async () => {
  const client = await readFile('src/services/telegram.ts', 'utf8');
  const server = await readFile('api/telegram/post-listing.ts', 'utf8');
  const notification = await readFile('api/telegram/send-notification.ts', 'utf8');

  assert.match(client, /\/l\/\$\{encodeURIComponent\(toPublicListingId\(listing\.id\)\)\}/);
  assert.match(server, /\/l\/\$\{encodeURIComponent\(toPublicListingId\(listingId\)\)\}/);
  assert.match(notification, /toPublicListingId\(String\(body\.listingId/);

  for (const source of [client, server]) {
    assert.doesNotMatch(source, /oldisotti\.uz/i);
    assert.doesNotMatch(source, /\/\?listing=/i);
  }
});

test('sitemap excludes seeded numeric demo inventory while preserving historical real aliases', async () => {
  const source = await readFile('api/sitemap.ts', 'utf8');
  assert.match(source, /\.filter\(\(id\) => !LEGACY_DEMO_ID\.test\(id\)\)/);
  assert.match(source, /oldisotdi-listing-/);
  assert.doesNotMatch(source, /oldisotdi-demo-/);
});

test('listing renderer returns noindex 404 for seeded demo and missing listings', async () => {
  const source = await readFile('api/listing-page.ts', 'utf8');
  assert.match(source, /isSeededDemoId\(requestedId\)/);
  assert.match(source, /X-Robots-Tag', 'noindex'/);
  assert.match(source, /return res\.status\(404\)\.send\('Listing not found'\)/);
  assert.match(source, /if \(!listing\)/);
  assert.match(source, /return res\.status\(404\)\.send\(baseHtml\)/);
});
