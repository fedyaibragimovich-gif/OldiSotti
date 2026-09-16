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
