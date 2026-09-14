import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const BASE_URL = (process.env.BASE_URL || 'https://fedyaibragimovich-gif.vercel.app').replace(/\/$/, '');
const RUN_ID = process.env.GITHUB_RUN_ID || String(Date.now());
const RUN_ATTEMPT = process.env.GITHUB_RUN_ATTEMPT || '1';
const PROJECT_ID = 'gen-lang-client-0261863601';
const DATABASE_ID = 'ai-studio-bazaarbuilder-41fa17d8-6b10-46d7-a618-e3efc2bd76de';
const STORAGE_BUCKET = 'gen-lang-client-0261863601.firebasestorage.app';
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountRaw) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required for safe live-test cleanup.');
}

const suffix = `${RUN_ID}-${RUN_ATTEMPT}`;
const sellerEmail = `oldisotdi.e2e.seller.${suffix}@example.com`;
const buyerEmail = `oldisotdi.e2e.buyer.${suffix}@example.com`;
const password = `E2e-${suffix}-Aa!9`;
const listingTitle = `E2E LIVE ${suffix}`;
const buyerPing = `E2E buyer ping ${suffix}`;
const sellerPong = `E2E seller pong ${suffix}`;
const artifactDir = path.resolve('artifacts/live-e2e');
fs.mkdirSync(artifactDir, { recursive: true });

const serviceAccount = JSON.parse(serviceAccountRaw);
const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
});
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp, DATABASE_ID);
const bucket = getStorage(adminApp).bucket();

const result = {
  baseUrl: BASE_URL,
  runId: RUN_ID,
  viewport: { width: 360, height: 800 },
  stages: [],
  listingId: null,
  listingInitialStatus: null,
  cleanup: [],
};

function pass(name, details = '') {
  result.stages.push({ name, status: 'PASS', details });
  console.log(`PASS: ${name}${details ? ` — ${details}` : ''}`);
}

function fail(name, error) {
  const message = error instanceof Error ? error.message : String(error);
  result.stages.push({ name, status: 'FAIL', details: message });
  console.error(`FAIL: ${name} — ${message}`);
}

async function waitForApp(page) {
  await page.locator('#bottom-navigation-dock').waitFor({ state: 'visible', timeout: 30_000 });
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  const widest = Math.max(metrics.documentWidth, metrics.bodyWidth);
  if (widest > metrics.innerWidth + 1) {
    throw new Error(`${label}: horizontal overflow ${widest}px > viewport ${metrics.innerWidth}px`);
  }
  console.log(`Mobile width OK: ${label} (${metrics.innerWidth}px viewport, ${widest}px content)`);
}

async function assertBottomNavFits(page) {
  const ids = [
    '#bottom-nav-home-btn',
    '#bottom-nav-messages-btn',
    '#bottom-nav-post-ad-btn',
    '#bottom-nav-favorites-btn',
    '#bottom-nav-profile-btn',
  ];
  for (const id of ids) {
    const locator = page.locator(id);
    await locator.waitFor({ state: 'visible' });
    const box = await locator.boundingBox();
    if (!box) throw new Error(`${id} has no visible bounding box`);
    const width = page.viewportSize()?.width || 360;
    if (box.x < -1 || box.x + box.width > width + 1) {
      throw new Error(`${id} is clipped at mobile width`);
    }
  }
}

async function openAuth(page, mode) {
  await page.locator('#bottom-nav-profile-btn').click();
  const label = mode === 'register' ? "Ro'yxatdan o'tish" : 'Kirish';
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await page.getByLabel('Email').waitFor({ state: 'visible', timeout: 10_000 });
}

async function register(page, email) {
  await openAuth(page, 'register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Parol').fill(password);
  await page.getByRole('button', { name: "Ro'yxatdan o'tish", exact: true }).first().click();
  await page.getByLabel('Email').waitFor({ state: 'detached', timeout: 20_000 });
}

async function verifySignedIn(page, email) {
  await page.locator('#bottom-nav-profile-btn').click();
  await page.getByText(email, { exact: true }).waitFor({ state: 'visible', timeout: 15_000 });
  await page.mouse.click(8, 8);
  await page.getByText(email, { exact: true }).waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
}

async function logout(page) {
  await page.locator('#bottom-nav-profile-btn').click();
  page.once('dialog', async dialog => dialog.accept());
  await page.getByRole('button', { name: 'Chiqish', exact: true }).click();
  await page.waitForTimeout(600);
}

async function login(page, email) {
  await openAuth(page, 'login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Parol').fill(password);
  await page.getByRole('button', { name: 'Kirish', exact: true }).first().click();
  await page.getByLabel('Email').waitFor({ state: 'detached', timeout: 20_000 });
}

async function findListingByTitle(timeoutMs = 25_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const snap = await adminDb.collection('listings').where('title', '==', listingTitle).limit(1).get();
    if (!snap.empty) return snap.docs[0];
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  throw new Error(`Live listing not found in Firestore: ${listingTitle}`);
}

async function deleteQuery(query, label) {
  const snap = await query.get();
  if (snap.empty) return 0;
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = adminDb.batch();
    for (const doc of snap.docs.slice(i, i + 400)) {
      batch.delete(doc.ref);
      deleted += 1;
    }
    await batch.commit();
  }
  result.cleanup.push(`${label}:${deleted}`);
  return deleted;
}

async function deleteAuthUserByEmail(email) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.deleteUser(user.uid);
    result.cleanup.push(`auth:${email}`);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error;
  }
}

let browser;
let sellerContext;
let buyerContext;
let sellerPage;
let buyerPage;
let listingId = null;
let sellerUid = null;
let primaryError = null;

try {
  browser = await chromium.launch({ headless: true });
  sellerContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
  sellerPage = await sellerContext.newPage();

  await sellerPage.goto(`${BASE_URL}/?lang=uz`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await waitForApp(sellerPage);
  await assertNoHorizontalOverflow(sellerPage, 'home');
  await assertBottomNavFits(sellerPage);
  await sellerPage.screenshot({ path: path.join(artifactDir, '01-mobile-home.png'), fullPage: true });
  pass('Mobile home layout', '360×800, bottom navigation visible and no horizontal overflow');

  await register(sellerPage, sellerEmail);
  await sellerPage.reload({ waitUntil: 'domcontentloaded' });
  await waitForApp(sellerPage);
  await verifySignedIn(sellerPage, sellerEmail);
  pass('Seller registration + auth persistence', sellerEmail);

  await logout(sellerPage);
  await login(sellerPage, sellerEmail);
  await verifySignedIn(sellerPage, sellerEmail);
  pass('Email/password login', 'logout → login succeeded on production');

  await sellerPage.locator('#bottom-nav-post-ad-btn').click();
  await sellerPage.locator('#post-ad-title-input').waitFor({ state: 'visible', timeout: 10_000 });
  await assertNoHorizontalOverflow(sellerPage, 'post-ad modal');
  await sellerPage.locator('#post-ad-title-input').fill(listingTitle);
  await sellerPage.locator('#post-ad-description-input').fill('Disposable production E2E listing. It is removed automatically after the test.');
  await sellerPage.locator('#post-contact-name').fill('E2E Seller');
  await sellerPage.locator('#post-contact-phone').fill('+998 90 000 00 01');
  await sellerPage.locator('input[type="number"]').fill('1234567');

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABFaP0WAAAADUlEQVR42mNk+M/wHwAEAQH/6CkP5QAAAABJRU5ErkJggg==', 'base64');
  await sellerPage.locator('input[type="file"]').setInputFiles({ name: 'e2e.png', mimeType: 'image/png', buffer: png });
  await sellerPage.getByText('Rasmlar tayyorlanmoqda…', { exact: true }).waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
  await sellerPage.screenshot({ path: path.join(artifactDir, '02-mobile-post-form.png'), fullPage: true });
  await sellerPage.locator('form button[type="submit"]').click();
  await sellerPage.getByRole('button', { name: "E'lonni ko'rish", exact: true }).waitFor({ state: 'visible', timeout: 35_000 });
  pass('Live listing submission', 'real Firebase Storage image upload + Firestore listing creation succeeded');

  const listingDoc = await findListingByTitle();
  listingId = listingDoc.id;
  result.listingId = listingId;
  result.listingInitialStatus = listingDoc.data().status || null;
  sellerUid = listingDoc.data().userId || null;
  if (listingDoc.data().status !== 'active') {
    await listingDoc.ref.update({ status: 'active' });
    console.log(`E2E listing temporarily activated for buyer/chat test (initial status: ${listingDoc.data().status}).`);
  }
  pass('Listing verified in live Firestore', `${listingId}; initial status=${result.listingInitialStatus}`);

  await sellerPage.getByRole('button', { name: "E'lonni ko'rish", exact: true }).click();

  buyerContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
  buyerPage = await buyerContext.newPage();
  await buyerPage.goto(`${BASE_URL}/?lang=uz`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await waitForApp(buyerPage);
  await register(buyerPage, buyerEmail);
  await verifySignedIn(buyerPage, buyerEmail);
  pass('Second account registration', buyerEmail);

  await buyerPage.goto(`${BASE_URL}/?lang=uz&listing=${encodeURIComponent(listingId)}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await waitForApp(buyerPage);
  await buyerPage.locator('#write-message-btn').waitFor({ state: 'visible', timeout: 25_000 });
  await assertNoHorizontalOverflow(buyerPage, 'listing detail');
  await buyerPage.screenshot({ path: path.join(artifactDir, '03-mobile-listing-detail.png'), fullPage: true });
  await buyerPage.locator('#write-message-btn').click();

  const buyerChatInput = buyerPage.locator('input[type="text"][maxlength="2000"]');
  await buyerChatInput.waitFor({ state: 'visible', timeout: 25_000 });
  await assertNoHorizontalOverflow(buyerPage, 'buyer chat');
  await buyerChatInput.fill(buyerPing);
  await buyerPage.getByRole('button', { name: 'Yuborish', exact: true }).click();
  await buyerPage.getByText(buyerPing, { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  pass('Buyer → seller live message', buyerPing);

  await sellerPage.reload({ waitUntil: 'domcontentloaded', timeout: 45_000 });
  await waitForApp(sellerPage);
  await sellerPage.locator('#bottom-nav-messages-btn .animate-pulse').waitFor({ state: 'visible', timeout: 25_000 });
  await sellerPage.locator('#bottom-nav-messages-btn').click();
  await sellerPage.getByText(buyerPing, { exact: true }).waitFor({ state: 'visible', timeout: 25_000 });
  const sellerChatInput = sellerPage.locator('input[type="text"][maxlength="2000"]');
  await sellerChatInput.waitFor({ state: 'visible', timeout: 10_000 });
  await assertNoHorizontalOverflow(sellerPage, 'seller chat');
  await sellerChatInput.fill(sellerPong);
  await sellerPage.getByRole('button', { name: 'Yuborish', exact: true }).click();
  await sellerPage.getByText(sellerPong, { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  pass('Seller received buyer message and replied', sellerPong);

  await buyerPage.getByText(sellerPong, { exact: true }).waitFor({ state: 'visible', timeout: 25_000 });
  await buyerPage.screenshot({ path: path.join(artifactDir, '04-mobile-two-account-chat.png'), fullPage: true });
  pass('Two-account realtime chat round trip', 'buyer saw seller reply without reload');
} catch (error) {
  primaryError = error;
  fail('Live E2E execution', error);
} finally {
  await browser?.close().catch(() => {});

  const cleanupErrors = [];
  try {
    if (!listingId) {
      const snap = await adminDb.collection('listings').where('title', '==', listingTitle).limit(1).get();
      if (!snap.empty) {
        listingId = snap.docs[0].id;
        sellerUid ||= snap.docs[0].data().userId || null;
      }
    }

    if (listingId) {
      const conversations = await adminDb.collection('conversations').where('listingId', '==', listingId).get();
      for (const conv of conversations.docs) {
        await deleteQuery(adminDb.collection('notifications').where('chatId', '==', conv.id), `notifications:${conv.id}`);
        await conv.ref.delete();
        result.cleanup.push(`conversation:${conv.id}`);
      }
      await adminDb.collection('listings').doc(listingId).delete().catch(error => {
        if (error?.code !== 5) throw error;
      });
      result.cleanup.push(`listing:${listingId}`);
      if (sellerUid) {
        await bucket.deleteFiles({ prefix: `users/${sellerUid}/listings/${listingId}/` });
        result.cleanup.push(`storage:users/${sellerUid}/listings/${listingId}/`);
      }
    }
  } catch (error) {
    cleanupErrors.push(error);
    console.error('Cleanup data error:', error);
  }

  for (const email of [sellerEmail, buyerEmail]) {
    try {
      await deleteAuthUserByEmail(email);
    } catch (error) {
      cleanupErrors.push(error);
      console.error(`Cleanup auth error for ${email}:`, error);
    }
  }

  result.cleanupStatus = cleanupErrors.length ? 'FAIL' : 'PASS';
  fs.writeFileSync(path.join(artifactDir, 'result.json'), JSON.stringify(result, null, 2));
  console.log(`Cleanup: ${result.cleanupStatus}`);

  if (primaryError) throw primaryError;
  if (cleanupErrors.length) throw new Error(`Live test passed but cleanup had ${cleanupErrors.length} error(s).`);
}
