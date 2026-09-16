import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/data/mockListings.ts', import.meta.url), 'utf8');

test('production fallback inventory stays empty', () => {
  assert.match(source, /export\s+const\s+mockListings\s*:\s*Listing\[\]\s*=\s*\[\s*\]/);
  assert.match(source, /export\s+const\s+mockConversations\s*:\s*Conversation\[\]\s*=\s*\[\s*\]/);
  assert.doesNotMatch(source, /id\s*:\s*['"]olx-\d+/);
});
