import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const support = readFileSync(new URL('../src/components/SupportAssistant.tsx', import.meta.url), 'utf8');
const categories = readFileSync(new URL('../src/components/CategoriesBar.tsx', import.meta.url), 'utf8');
const maintenance = readFileSync(new URL('../src/components/MaintenanceNotice.tsx', import.meta.url), 'utf8');
const bottomNav = readFileSync(new URL('../src/components/BottomNav.tsx', import.meta.url), 'utf8');

test('AI help clears the 64px bottom navigation and hides when the keyboard opens', () => {
  assert.match(support, /useVirtualKeyboard\(\)/);
  assert.match(support, /calc\(64px \+ env\(safe-area-inset-bottom, 0px\) \+ 16px\)/);
  assert.match(support, /open \|\| isKeyboardOpen \? 'pointer-events-none opacity-0'/);
  assert.match(bottomNav, /id="bottom-navigation-dock"/);
  assert.match(support, /<dialog ref=\{dialog\}/);
});

test('maintenance notice does not shift the header and remains reopenable after dismissing', () => {
  assert.match(categories, /<MaintenanceNotice lang=\{lang\}/);
  assert.match(maintenance, /#root > div > div\.bg-rose-600:first-child/);
  assert.match(maintenance, /fixed left-3 right-3 top-16/);
  assert.match(maintenance, /window\.sessionStorage\.setItem\(DISMISSED_KEY, '1'\)/);
  assert.match(maintenance, /onClick=\{\(\) => setDismissed\(false\)\}/);
  assert.match(maintenance, /aria-label=\{t\.close\}/);
});

test('category bento retains existing filter identifiers and selections with legible responsive tiles', () => {
  assert.match(categories, /grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6/);
  assert.match(categories, /min-h-\[108px\]/);
  assert.match(categories, /aria-pressed=\{isSelected\}/);
  assert.match(categories, /id=\{`cat-btn-\$\{cat\.slug\}`\}/);
  assert.match(categories, /onSelectCategory\(cat\.id\)/);
  assert.match(categories, /onSelectSubcategory\(sub\.id\)/);
});
