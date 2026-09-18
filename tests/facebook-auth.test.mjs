import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Facebook popup is initiated before asynchronous storage work', async () => {
  const source = await readFile('src/lib/facebookAuth.ts', 'utf8');
  assert.match(source, /new FacebookAuthProvider\(\)/);
  assert.match(source, /provider\.addScope\('email'\)/);
  assert.match(source, /const popupResult = signInWithPopup\(auth, provider\)/);
  assert.ok(source.indexOf('signInWithPopup(auth, provider)') < source.indexOf('await popupResult'));
  assert.ok(source.indexOf('signInWithPopup(auth, provider)') < source.indexOf('await setPersistence(auth, browserLocalPersistence)'));
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

test('Vercel proxies Firebase OAuth helpers transparently before SPA fallback', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const helperIndex = config.rewrites.findIndex(item => item.source === '/__/auth/:path*');
  const initIndex = config.rewrites.findIndex(item => item.source === '/__/firebase/init.json');
  const fallbackIndex = config.rewrites.findIndex(item => item.source === '/(.*)');
  assert.ok(helperIndex !== -1 && initIndex !== -1 && fallbackIndex !== -1);
  assert.ok(helperIndex < fallbackIndex && initIndex < fallbackIndex);
  assert.equal(config.rewrites[helperIndex].destination, 'https://gen-lang-client-0261863601.firebaseapp.com/__/auth/:path*');
  assert.equal(config.rewrites[initIndex].destination, 'https://gen-lang-client-0261863601.firebaseapp.com/__/firebase/init.json');
  assert.equal(config.rewrites[fallbackIndex].destination, '/index.html');
  const firebaseConfig = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
  assert.equal(firebaseConfig.authDomain, 'gen-lang-client-0261863601.firebaseapp.com', 'Do not switch authDomain until Google OAuth callback is authorized and the proxy is verified');
});
