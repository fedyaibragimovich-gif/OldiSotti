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

test('sitemap aliases historical OLX IDs instead of publishing them directly', async () => {
  const source = await readFile('api/sitemap.ts', 'utf8');
  assert.match(source, /oldisotdi-listing-/);
  assert.match(source, /oldisotdi-demo-/);
});
