import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Google popup opens synchronously before any asynchronous persistence work', async () => {
  const source = await readFile('src/lib/auth.ts', 'utf8');
  const start = source.indexOf('export const loginWithGoogle = async () => {');
  const end = source.indexOf('\nexport const logoutUser', start);
  assert.ok(start >= 0 && end > start, 'Google login function must exist');
  const google = source.slice(start, end);
  assert.match(google, /new GoogleAuthProvider\(\)/);
  assert.match(google, /provider\.setCustomParameters\(\{ prompt: 'select_account' \}\)/);
  assert.match(google, /const popupResult = signInWithPopup\(auth, provider\)/);
  assert.match(google, /const credential = await popupResult/);
  assert.ok(google.indexOf('signInWithPopup(auth, provider)') < google.indexOf('await popupResult'));
  assert.ok(google.indexOf('await popupResult') < google.indexOf('await persistAuthSession()'));
  assert.match(google, /catch\s*\{[\s\S]*return credential;/);
});

test('Google change preserves mobile Facebook SDK credential exchange', async () => {
  const facebook = await readFile('src/lib/facebookAuth.ts', 'utf8');
  assert.match(facebook, /signInWithCredential\(auth, FacebookAuthProvider\.credential\(token\)\)/);
  assert.match(facebook, /mobile \? signInWithFacebookSdk\(\) : signInWithPopup\(auth, provider\)/);
});
