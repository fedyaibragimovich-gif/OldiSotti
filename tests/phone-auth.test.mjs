import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  normalizePhoneOtp,
  normalizeUzbekPhoneToE164,
  phoneToPasswordEmail
} from '../src/lib/phoneAuth.ts';

test('Uzbek phone numbers normalize to one canonical E.164 value', () => {
  assert.equal(normalizeUzbekPhoneToE164('90 123 45 67'), '+998901234567');
  assert.equal(normalizeUzbekPhoneToE164('+998 90 123-45-67'), '+998901234567');
  assert.equal(normalizeUzbekPhoneToE164('998901234567'), '+998901234567');
  assert.equal(normalizeUzbekPhoneToE164('0901234567'), '+998901234567');
});

test('invalid or foreign phone shapes are rejected before Firebase', () => {
  assert.equal(normalizeUzbekPhoneToE164('90123456'), null);
  assert.equal(normalizeUzbekPhoneToE164('+1 202 555 0101'), null);
  assert.equal(normalizeUzbekPhoneToE164('9989012345678'), null);
  assert.equal(normalizeUzbekPhoneToE164(''), null);
});

test('phone password identifier is deterministic and never uses user input as raw email', () => {
  assert.equal(phoneToPasswordEmail('90 123 45 67'), 'phone-998901234567@auth.oldi-sotdi.uz');
  assert.equal(phoneToPasswordEmail('+998901234567'), 'phone-998901234567@auth.oldi-sotdi.uz');
  assert.equal(phoneToPasswordEmail('+1 202 555 0101'), null);
});

test('OTP accepts exactly six numeric digits', () => {
  assert.equal(normalizePhoneOtp('123456'), '123456');
  assert.equal(normalizePhoneOtp('12 34-56'), '123456');
  assert.equal(normalizePhoneOtp('12345'), null);
  assert.equal(normalizePhoneOtp('1234567'), null);
  assert.equal(normalizePhoneOtp('abcdef'), null);
});

test('phone auth prefers durable browser-local persistence before fallbacks', async () => {
  const authSource = await readFile('src/lib/auth.ts', 'utf8');
  const localIndex = authSource.indexOf('setPersistence(auth, browserLocalPersistence)');
  const sessionIndex = authSource.indexOf('setPersistence(auth, browserSessionPersistence)');
  const memoryIndex = authSource.indexOf('setPersistence(auth, inMemoryPersistence)');
  assert.ok(localIndex >= 0, 'browserLocalPersistence must be configured');
  assert.ok(sessionIndex > localIndex, 'session persistence must only be a fallback');
  assert.ok(memoryIndex > sessionIndex, 'memory persistence must be the final fallback');
  assert.match(authSource, /loginWithPhonePassword[\s\S]*await persistAuthSession\(\)/);
  assert.match(authSource, /sendPhoneVerificationCode[\s\S]*await persistAuthSession\(\)/);
  assert.match(authSource, /confirmPhoneAndSetPassword[\s\S]*await persistAuthSession\(\)/);
});

test('phone password registration verifies SMS before linking Firebase password credentials', async () => {
  const authSource = await readFile('src/lib/auth.ts', 'utf8');
  const confirmIndex = authSource.indexOf('confirmationResult.confirm(normalizedCode)');
  const linkIndex = authSource.indexOf('linkWithCredential(user, passwordCredential)');
  assert.ok(confirmIndex >= 0, 'SMS code must be confirmed');
  assert.ok(linkIndex > confirmIndex, 'password credential must only be linked after SMS verification');
  assert.match(authSource, /loginWithPhonePassword[\s\S]*signInWithEmailAndPassword\(auth, passwordEmail, password\)/);
  assert.match(authSource, /hasPasswordProvider[\s\S]*updatePassword\(user, password\)/);
});

test('phone auth disposes reCAPTCHA after each SMS request and removes owned fallback containers', async () => {
  const authSource = await readFile('src/lib/auth.ts', 'utf8');
  assert.match(authSource, /dataset\.oldisotdiRecaptchaOwned = 'true'/);
  assert.match(authSource, /ownedRecaptchaContainer[\s\S]*remove\(\)/);
  assert.match(authSource, /signInWithPhoneNumber\(auth, normalizedPhone, verifier\)[\s\S]*finally[\s\S]*clearRecaptcha\(\)/);
});

test('phone UI requires password confirmation for registration/reset and keeps OTP autofill/resend', async () => {
  const modalSource = await readFile('src/components/AuthModal.tsx', 'utf8');
  assert.match(modalSource, /id="auth-phone-password-input"/);
  assert.match(modalSource, /id="auth-phone-confirm-password-input"/);
  assert.match(modalSource, /password !== confirmPassword/);
  assert.match(modalSource, /loginWithPhonePassword\(rawPhone, password\)/);
  assert.match(modalSource, /confirmPhoneAndSetPassword\(confirmationResult, otpCode, rawPhone, password\)/);
  assert.match(modalSource, /autoComplete="one-time-code"/);
  assert.match(modalSource, /maxLength=\{6\}/);
  assert.match(modalSource, /handleSendOtp\(undefined, true\)/);
  assert.match(modalSource, /id="recaptcha-container"/);
});
