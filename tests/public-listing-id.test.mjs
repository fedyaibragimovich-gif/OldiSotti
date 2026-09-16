import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLegacyDemoListingId, isLegacyOlxListingId, toLegacyListingId, toPublicListingId } from '../src/lib/publicListingId.ts';

test('legacy demo IDs are exposed only through OldiSotdi demo aliases', () => {
  assert.equal(toPublicListingId('olx-001'), 'oldisotdi-demo-001');
  assert.equal(toPublicListingId('OLX-42'), 'oldisotdi-demo-42');
  assert.equal(toLegacyListingId('oldisotdi-demo-001'), 'olx-001');
  assert.equal(isLegacyDemoListingId('olx-001'), true);
});

test('legacy UUID listing IDs are also hidden from public URLs', () => {
  const legacy = 'olx-f7a80c90-f404-4b78-90e6-c58a92e04243';
  const publicId = 'oldisotdi-listing-f7a80c90-f404-4b78-90e6-c58a92e04243';
  assert.equal(toPublicListingId(legacy), publicId);
  assert.equal(toLegacyListingId(publicId), legacy);
  assert.equal(isLegacyOlxListingId(legacy), true);
});

test('OldiSotdi-native listing IDs pass through unchanged', () => {
  const id = 'oldisotdi-2026-09-16-abc123';
  assert.equal(toPublicListingId(id), id);
  assert.equal(toLegacyListingId(id), id);
  assert.equal(isLegacyDemoListingId(id), false);
  assert.equal(isLegacyOlxListingId(id), false);
});
