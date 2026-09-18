import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Facebook login uses the Firebase provider and a user-initiated popup', async () => {
  const source = await readFile('src/lib/facebookAuth.ts', 'utf8');
  assert.match(source, /new FacebookAuthProvider\(\)/);
  assert.match(source, /signInWithPopup\(auth, provider\)/);
  assert.match(source, /provider\.addScope\('email'\)/);
  assert.match(source, /setPersistence\(auth, browserLocalPersistence\)/);
  assert.ok(source.indexOf('browserLocalPersistence') < source.indexOf('browserSessionPersistence'));
  assert.doesNotMatch(source, /appSecret\s*[:=]|access_token\s*[:=]/i);
});

test('Facebook login is exposed in the auth modal, with loading and error handling', async () => {
  const source = await readFile('src/components/AuthModal.tsx', 'utf8');
  assert.match(source, /id="auth-facebook-btn"/);
  assert.match(source, /onClick=\{handleFacebook\}/);
  assert.match(source, /disabled=\{authLoading \|\| forgotLoading\}/);
  assert.match(source, /await loginWithFacebook\(\)/);
  assert.match(source, /setAuthError\(friendlyAuthError\(error, 'facebook'\)\)/);
  assert.match(source, /account-exists-with-different-credential/);
  assert.doesNotMatch(source, /linkWithCredential\(/);
  assert.match(source, /Facebook bilan davom etish/);
  assert.match(source, /Продолжить с Facebook/);
});
