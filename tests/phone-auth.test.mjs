import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizePhoneOtp, normalizeUzbekPhoneToE164 } from '../src/lib/phoneAuth.ts';

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

test('OTP accepts exactly six numeric digits', () => {
  assert.equal(normalizePhoneOtp('123456'), '123456');
  assert.equal(normalizePhoneOtp('12 34-56'), '123456');
  assert.equal(normalizePhoneOtp('12345'), null);
  assert.equal(normalizePhoneOtp('abcdef'), null);
});

test('phone auth disposes reCAPTCHA after each SMS request and removes owned fallback containers', async () => {
  const authSource = await readFile('src/lib/auth.ts', 'utf8');
  assert.match(authSource, /dataset\.oldisotdiRecaptchaOwned = 'true'/);
  assert.match(authSource, /ownedRecaptchaContainer.*remove\(\)/s);
  assert.match(authSource, /signInWithPhoneNumber\(auth, normalizedPhone, verifier\)[\s\S]*finally[\s\S]*clearRecaptcha\(\)/);
});

test('phone UI keeps mobile OTP autofill and resend flow wired', async () => {
  const modalSource = await readFile('src/components/AuthModal.tsx', 'utf8');
  assert.match(modalSource, /autoComplete="one-time-code"/);
  assert.match(modalSource, /maxLength=\{6\}/);
  assert.match(modalSource, /handleSendOtp\(undefined, true\)/);
  assert.match(modalSource, /id="recaptcha-container"/);
});
