import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLegacyDemoListingId, toLegacyListingId, toPublicListingId } from '../src/lib/publicListingId.ts';

test('legacy demo IDs are exposed only through OldiSotdi public aliases', () => {
  assert.equal(toPublicListingId('olx-001'), 'oldisotdi-demo-001');
  assert.equal(toPublicListingId('OLX-42'), 'oldisotdi-demo-42');
  assert.equal(toLegacyListingId('oldisotdi-demo-001'), 'olx-001');
  assert.equal(isLegacyDemoListingId('olx-001'), true);
});

test('real listing IDs pass through unchanged', () => {
  const id = 'listing_2026_09_16_abc123';
  assert.equal(toPublicListingId(id), id);
  assert.equal(toLegacyListingId(id), id);
  assert.equal(isLegacyDemoListingId(id), false);
});
