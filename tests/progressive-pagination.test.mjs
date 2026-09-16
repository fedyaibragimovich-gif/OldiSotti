import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/components/Pagination.tsx', import.meta.url), 'utf8');

test('progressive pagination reports cumulative visible count', () => {
  assert.match(source, /const visibleCount = Math\.min\(displayedCount, totalItems\)/);
  assert.match(source, /Показано \$\{visibleCount\} из \$\{totalItems\}/);
  assert.match(source, /Bosqich'\} \{currentPage\} \/ \{totalPages\}/);
  assert.doesNotMatch(source, /const startItem =/);
  assert.doesNotMatch(source, /\$\{startItem\}–\$\{endItem\}/);
});
