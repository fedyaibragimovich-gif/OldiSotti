import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const nav = readFileSync(new URL('../src/components/BottomNav.tsx', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../src/components/ProfileSettingsContent.tsx', import.meta.url), 'utf8');

test('mobile settings exposes both requested sections above discreet sign-out', () => {
  assert.match(nav, /<ProfileSettingsContent user=\{user\} lang=\{lang\}/);
  assert.match(settings, /id="bottom-profile-account-btn"/);
  assert.match(settings, /id="bottom-profile-appearance-btn"/);
  assert.ok(nav.indexOf('<ProfileSettingsContent') < nav.indexOf('id="bottom-profile-logout-btn"'));
  assert.match(nav, /id="bottom-profile-logout-confirm-btn"/);
});

test('account name updates Firebase with input validation, without changing contact identifiers', () => {
  assert.match(settings, /normalized\.length < 2 \|\| normalized\.length > 80/);
  assert.match(settings, /await updateProfile\(user, \{ displayName: normalized \}\)/);
  assert.match(settings, /isInternalPhonePasswordEmail|syntheticEmail/);
  assert.doesNotMatch(settings, /updateEmail\(|updatePhoneNumber\(/);
});

test('language and appearance reuse app preference keys and keep both login providers untouched', () => {
  assert.match(settings, /browserStorage\.setItem\('olx_lang', next\)/);
  assert.match(settings, /url\.searchParams\.set\('lang', next\)/);
  assert.match(settings, /browserStorage\.setItem\('olx_dark_mode', String\(next === 'dark'\)\)/);
  assert.match(settings, /window\.location\.reload\(\)/);
  assert.doesNotMatch(settings, /signInWithPopup|signInWithCredential|signOut/);
});
