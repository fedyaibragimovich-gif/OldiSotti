import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import {
  initializeApp,
  deleteApp
} from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  deleteUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  deleteObject
} from 'firebase/storage';

const firebaseConfig = JSON.parse(fs.readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const BASE_URL = (process.env.BASE_URL || 'https://fedyaibragimovich-gif.vercel.app').replace(/\/$/, '');
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const PASSWORD = `OldiSotdi!${RUN_ID}`;
const SELLER_EMAIL = `oldisotdi-e2e-seller-${RUN_ID}@example.com`;
const BUYER_EMAIL = `oldisotdi-e2e-buyer-${RUN_ID}@example.com`;
const LISTING_TITLE = `E2E mobile test ${RUN_ID}`;
const BUYER_MESSAGE = `E2E buyer message ${RUN_ID}`;
const SELLER_REPLY = `E2E seller reply ${RUN_ID}`;

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZK4sAAAAASUVORK5CYII=',
  'base64'
);

async function accountSession(email, password, name, callback) {
  const app = initializeApp(firebaseConfig, `${name}-${RUN_ID}-${Math.random().toString(36).slice(2)}`);
  const auth = getAuth(app);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    const storage = getStorage(app);
    return await callback({ app, auth, db, storage, user: auth.currentUser });
  } finally {
    await signOut(auth).catch(() => {});
    await deleteApp(app).catch(() => {});
  }
}

async function findSellerListing() {
  return accountSession(SELLER_EMAIL, PASSWORD, 'seller-find', async ({ db, user }) => {
    const snapshot = await getDocs(query(collection(db, 'listings'), where('userId', '==', user.uid)));
    const match = snapshot.docs.find((item) => item.data().title === LISTING_TITLE);
    return match ? { id: match.id, ...match.data() } : null;
  });
}

async function findConversation() {
  return accountSession(BUYER_EMAIL, PASSWORD, 'buyer-find', async ({ db, user }) => {
    const snapshot = await getDocs(query(collection(db, 'conversations'), where('buyerId', '==', user.uid)));
    const match = snapshot.docs.find((item) => item.data().listingTitle === LISTING_TITLE);
    return match ? { id: match.id, ...match.data() } : null;
  });
}

async function cleanupAccount(email, password, role, listingId) {
  try {
    await accountSession(email, password, `${role}-cleanup`, async ({ auth, db, storage, user }) => {
      if (role === 'buyer') {
        const conversations = await getDocs(query(collection(db, 'conversations'), where('buyerId', '==', user.uid)));
        for (const item of conversations.docs) {
          if (item.data().listingId === listingId || item.data().listingTitle === LISTING_TITLE) {
            await deleteDoc(item.ref).catch(() => {});
          }
        }
      }

      const notifications = await getDocs(query(collection(db, 'notifications'), where('recipientId', '==', user.uid))).catch(() => null);
      if (notifications) {
        for (const item of notifications.docs) {
          if (item.data().listingId === listingId) await deleteDoc(item.ref).catch(() => {});
        }
      }

      if (role === 'seller') {
        const listings = await getDocs(query(collection(db, 'listings'), where('userId', '==', user.uid)));
        for (const item of listings.docs) {
          if (item.id !== listingId && item.data().title !== LISTING_TITLE) continue;
          for (const image of item.data().images || []) {
            if (typeof image === 'string' && image.includes('firebasestorage.googleapis.com')) {
              await deleteObject(storageRef(storage, image)).catch(() => {});
            }
          }
          await deleteDoc(item.ref).catch(() => {});
        }
      }

      if (auth.currentUser) await deleteUser(auth.currentUser).catch(() => {});
    });
  } catch {
    // Cleanup is best-effort; test assertions should report the actual functional failure.
  }
}

async function openProfile(page) {
  await page.locator('#bottom-nav-profile-btn').click();
}

function emailInput(page) {
  return page.locator('input[name="email"][type="email"]');
}

function passwordInput(page) {
  return page.locator('input[name="password"][type="password"]');
}

async function registerFromUi(page, email) {
  await openProfile(page);
  await page.getByRole('button', { name: "Ro'yxatdan o'tish", exact: true }).click();
  await emailInput(page).fill(email);
  await passwordInput(page).fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: "Ro'yxatdan o'tish", exact: true }).click();
  await expect(page.getByText('OldiSotdi akkauntingiz')).toBeHidden({ timeout: 20_000 });
}

async function logoutFromUi(page) {
  await openProfile(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Chiqish', exact: true }).click();
  await expect(page.locator('#bottom-nav-profile-btn')).toBeVisible();
}

async function loginFromUi(page, email) {
  await openProfile(page);
  await page.getByRole('button', { name: 'Kirish', exact: true }).click();
  await emailInput(page).fill(email);
  await passwordInput(page).fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: 'Kirish', exact: true }).click();
  await expect(page.getByText('OldiSotdi akkauntingiz')).toBeHidden({ timeout: 20_000 });
}

test.use({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36',
  hasTouch: true,
  isMobile: true
});

test('production mobile registration, reset, photo listing and two-account chat', async ({ page }) => {
  test.setTimeout(180_000);
  let listingId = '';

  try {
    await page.goto(`${BASE_URL}/?lang=uz`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#bottom-navigation-dock')).toBeVisible({ timeout: 20_000 });

    // 1) Real Firebase Auth registration through the production mobile UI.
    await registerFromUi(page, SELLER_EMAIL);

    // 2) Logout, trigger a real Firebase password-reset request, then log back in.
    await logoutFromUi(page);
    await openProfile(page);
    await page.getByRole('button', { name: 'Kirish', exact: true }).click();
    await emailInput(page).fill(SELLER_EMAIL);
    await page.getByRole('button', { name: 'Parolni unutdingizmi?' }).click();
    await expect(page.getByText(/Parolni tiklash havolasi emailingizga yuborildi/i)).toBeVisible({ timeout: 20_000 });
    await passwordInput(page).fill(PASSWORD);
    await page.locator('form').getByRole('button', { name: 'Kirish', exact: true }).click();
    await expect(page.getByText('OldiSotdi akkauntingiz')).toBeHidden({ timeout: 20_000 });

    // 3) Mobile photo upload + production Cloud Storage + Firestore listing creation.
    await page.locator('#bottom-nav-post-ad-btn').click();
    await expect(page.locator('#post-ad-title-input')).toBeVisible({ timeout: 20_000 });
    await page.locator('#post-ad-title-input').fill(LISTING_TITLE);
    await page.locator('input[type="file"]').setInputFiles({ name: 'e2e-mobile.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await page.locator('input[type="number"]').first().fill('125000');
    await page.locator('#post-ad-description-input').fill(`Production mobile E2E listing ${RUN_ID}`);
    await page.locator('#post-contact-name').fill('OldiSotdi E2E Seller');
    await page.locator('#post-contact-phone').fill('+998 90 123 45 67');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText(/moderatsiyaga yuborildi|muvaffaqiyatli saqlandi/i)).toBeVisible({ timeout: 60_000 });

    await expect.poll(findSellerListing, { timeout: 30_000, intervals: [1000, 2000, 3000] }).not.toBeNull();
    const listing = await findSellerListing();
    expect(listing, 'Production listing was not persisted in Firestore').not.toBeNull();
    listingId = listing.id;
    expect(Array.isArray(listing.images) && listing.images.some((url) => String(url).includes('firebasestorage.googleapis.com')), 'Photo was not persisted in Firebase Storage').toBeTruthy();

    // A buyer may only start a real production chat with an active listing.
    // If moderation is enabled, this assertion deliberately exposes that launch gate.
    expect(listing.status, 'Two-account chat E2E requires this temporary listing to be active; production moderation left it pending').toBe('active');

    await logoutFromUi(page);

    // 4) Second real Firebase account starts chat and sends a message.
    await registerFromUi(page, BUYER_EMAIL);
    await page.goto(`${BASE_URL}/l/${encodeURIComponent(listingId)}?lang=uz`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(LISTING_TITLE, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    await page.locator('#write-message-btn').click();
    await expect(page.getByText(/Assalomu alaykum/).last()).toBeVisible({ timeout: 20_000 });
    const chatInput = page.locator('input[type="text"][maxlength="2000"]');
    await chatInput.fill(BUYER_MESSAGE);
    await page.getByRole('button', { name: 'Yuborish' }).click();
    await expect(page.getByText(BUYER_MESSAGE, { exact: true })).toBeVisible({ timeout: 20_000 });

    await expect.poll(findConversation, { timeout: 20_000, intervals: [1000, 2000] }).not.toBeNull();
    const conversation = await findConversation();
    expect(conversation, 'Buyer conversation was not persisted').not.toBeNull();

    // Close chat before logging out.
    await page.getByRole('button', { name: 'Yopish' }).click();
    await logoutFromUi(page);

    // 5) Seller logs in independently, receives the conversation and replies.
    await loginFromUi(page, SELLER_EMAIL);
    await page.locator('#bottom-nav-messages-btn').click();
    await expect(page.getByText(LISTING_TITLE, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    const conversationButton = page.getByRole('button').filter({ hasText: LISTING_TITLE }).first();
    if (await conversationButton.count()) await conversationButton.click();
    const sellerChatInput = page.locator('input[type="text"][maxlength="2000"]');
    await sellerChatInput.fill(SELLER_REPLY);
    await page.getByRole('button', { name: 'Yuborish' }).click();
    await expect(page.getByText(SELLER_REPLY, { exact: true })).toBeVisible({ timeout: 20_000 });

    const updatedConversation = await findConversation();
    expect(updatedConversation?.messages?.some((message) => message.text === BUYER_MESSAGE)).toBeTruthy();
    expect(updatedConversation?.messages?.some((message) => message.text === SELLER_REPLY)).toBeTruthy();
  } finally {
    // Buyer first so participant-owned chat can be removed before account deletion.
    await cleanupAccount(BUYER_EMAIL, PASSWORD, 'buyer', listingId);
    await cleanupAccount(SELLER_EMAIL, PASSWORD, 'seller', listingId);
  }
});
