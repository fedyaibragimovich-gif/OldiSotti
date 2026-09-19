import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const firebase = fs.readFileSync(new URL('../src/lib/firebase.ts', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('public realtime page is ordered and older pages use startAfter', () => {
  assert.match(firebase, /where\('status', '==', 'active'\)[\s\S]*orderBy\('createdAt', 'desc'\)/);
  assert.match(firebase, /startAfter\(lastCreatedAt\)/);
  assert.match(app, /fetchListingsPage\(FIRESTORE_PAGE_SIZE, previousCursor\)/);
  assert.match(app, /listingCursorRef/);
});

test('progressive loading no longer grows and re-reads the Firestore limit', () => {
  assert.doesNotMatch(app, /setFirestoreQueryLimit/);
  assert.doesNotMatch(app, /firestoreQueryLimit/);
  assert.match(app, /olderListingsRef/);
  assert.match(app, /cursorPagingStartedRef/);
});

test('admin and owner-private inventory retain broader realtime coverage', () => {
  assert.match(firebase, /isCurrentAdmin\(\)[\s\S]*LISTINGS_REALTIME_LIMIT/);
  assert.match(firebase, /where\('userId', '==', user\.uid\)[\s\S]*LISTINGS_REALTIME_LIMIT/);
});

test('both general and category-scoped public feed queries have declared composite indexes', () => {
  const indexes = JSON.parse(fs.readFileSync(new URL('../firestore.indexes.json', import.meta.url), 'utf8')).indexes;
  const hasFields = (fields) => indexes.some(index => index.collectionGroup === 'listings'
    && index.queryScope === 'COLLECTION'
    && JSON.stringify(index.fields) === JSON.stringify(fields.map(([fieldPath, order]) => ({ fieldPath, order }))));
  assert.ok(hasFields([['status', 'ASCENDING'], ['createdAt', 'DESCENDING']]));
  assert.ok(hasFields([['status', 'ASCENDING'], ['categoryId', 'ASCENDING'], ['createdAt', 'DESCENDING']]));
});

test('manual production mobile test targets the real customer domain', () => {
  const workflow = fs.readFileSync(new URL('../.github/workflows/production-mobile-e2e.yml', import.meta.url), 'utf8');
  assert.match(workflow, /BASE_URL: https:\/\/oldi-sotdi\.uz(?:\s|$)/);
});

test('dismissed site-news banner stays closed during the same browser session', () => {
  const vip = fs.readFileSync(new URL('../src/components/VipListings.tsx', import.meta.url), 'utf8');
  assert.match(vip, /sessionStorage\.getItem\(NEWS_DISMISSED_KEY\)/);
  assert.match(vip, /sessionStorage\.setItem\(NEWS_DISMISSED_KEY, '1'\)/);
  assert.match(vip, /useState\(shouldShowNews\)/);
});
