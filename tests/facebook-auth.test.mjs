import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Mobile Facebook login exchanges Meta JS SDK token directly for a Firebase credential', async () => {
  const source = await readFile('src/lib/facebookAuth.ts', 'utf8');
  assert.match(source, /FACEBOOK_APP_ID = '1760421308531409'/);
  assert.match(source, /connect\.facebook\.net\/en_US\/sdk\.js/);
  assert.match(source, /new MutationObserver\(/);
  assert.match(source, /document\.getElementById\('auth-facebook-btn'\)/);
  assert.match(source, /sdk\.login\(response => \{/);
  assert.match(source, /signInWithCredential\(auth, FacebookAuthProvider\.credential\(token\)\)/);
  assert.match(source, /mobile \? signInWithFacebookSdk\(\) : signInWithPopup\(auth, provider\)/);
  assert.ok(source.indexOf('sdk.login(response => {') < source.indexOf('const credential = await signInResult'));
  assert.ok(source.indexOf('const signInResult = mobile ?') < source.indexOf('await setPersistence(auth, browserLocalPersistence)'));
  assert.ok(source.indexOf('browserLocalPersistence') < source.indexOf('browserSessionPersistence'));
  assert.doesNotMatch(source, /appSecret\s*[:=]|access_token\s*[:=]|localStorage\.|sessionStorage\./i);
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

test('Firebase OAuth helper stays proxied and init config is served locally before SPA fallback', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const helperIndex = config.rewrites.findIndex(item => item.source === '/__/auth/:path*');
  const fallbackIndex = config.rewrites.findIndex(item => item.source === '/(.*)');
  assert.ok(helperIndex !== -1 && fallbackIndex !== -1);
  assert.ok(helperIndex < fallbackIndex);
  assert.equal(config.rewrites[helperIndex].destination, 'https://gen-lang-client-0261863601.firebaseapp.com/__/auth/:path*');
  assert.equal(config.rewrites.findIndex(item => item.source === '/__/firebase/init.json'), -1, 'Do not proxy init.json to an unavailable Firebase Hosting site');
  assert.equal(config.rewrites[fallbackIndex].destination, '/index.html');
  const firebaseConfig = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
  const initConfig = JSON.parse(await readFile('public/__/firebase/init.json', 'utf8'));
  assert.equal(firebaseConfig.authDomain, 'oldi-sotdi.uz', 'Use the authorized same-origin auth helper served by Vercel');
  assert.equal(firebaseConfig.projectId, 'gen-lang-client-0261863601');
  for (const key of ['apiKey', 'authDomain', 'projectId', 'appId', 'messagingSenderId', 'storageBucket']) {
    assert.equal(initConfig[key], firebaseConfig[key], `${key} must match the Firebase app configuration`);
  }
});
