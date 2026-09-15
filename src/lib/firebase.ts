import { readListing } from './listingData';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  increment,
  query,
  where,
  or,
  limit,
  orderBy,
  deleteField,
  runTransaction,
  startAfter
} from 'firebase/firestore';
import { Listing, Conversation, ChatMessage, PlatformSettings, ModerationReport, AppNotification } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

function initFirestoreInstance() {
  const dbId = firebaseConfig.firestoreDatabaseId || undefined;
  const isBrowser = typeof window !== 'undefined';
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: isBrowser,
      ignoreUndefinedProperties: true
    }, dbId);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = initFirestoreInstance();
export const LISTINGS_COLLECTION = 'listings';
export const CONVERSATIONS_COLLECTION = 'conversations';
export const SETTINGS_COLLECTION = 'platform_settings';
export const REPORTS_COLLECTION = 'moderation_reports';
export const NOTIFICATIONS_COLLECTION = 'notifications';
export const BLOCKED_SELLERS_COLLECTION = 'blocked_sellers';

const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
const ADMIN_EMAIL = 'fedya.ibragimovich@gmail.com';
const LISTINGS_REALTIME_LIMIT = 300;
const CONVERSATIONS_REALTIME_LIMIT = 100;
const NOTIFICATIONS_REALTIME_LIMIT = 50;

function isCurrentAdmin(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL);
}

// Firestore does not accept undefined values, including nested optional fields.
function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (item !== undefined) clean[key] = stripUndefinedDeep(item);
    });
    return clean as T;
  }
  return value;
}

export function subscribeToListings(
  onSuccess: (listings: Listing[], hasMore?: boolean) => void,
  onError?: (err: Error) => void,
  onLoading?: () => void,
  pageSize: number = 24
) {
  let stops: (() => void)[] = [];
  const stopAuth = onAuthStateChanged(auth, user => {
    stops.forEach(stop => stop());
    stops = [];
    onSuccess([]);
    onLoading?.();
    const sources = new Map<number, Listing[]>();
    const docCounts = new Map<number, number>();

    // Public and private queries are separate so unpublished listings never leak.
    // Query limit is applied to protect performance and bandwidth under real traffic!
    const queries = isCurrentAdmin()
      ? [query(collection(db, LISTINGS_COLLECTION), limit(pageSize))]
      : [
          query(collection(db, LISTINGS_COLLECTION), where('status', '==', 'active'), limit(pageSize)),
          ...(user && !user.isAnonymous ? [query(collection(db, LISTINGS_COLLECTION), where('userId', '==', user.uid), limit(pageSize))] : [])
        ];

    queries.forEach((q, index) => {
      stops.push(onSnapshot(q, snapshot => {
        sources.set(index, snapshot.docs.map(d => readListing(d.data(), d.id)).filter((item): item is Listing => item !== null));
        docCounts.set(index, snapshot.docs.length);

        const merged = new Map<string, Listing>();
        sources.forEach(items => items.forEach(item => merged.set(item.id, item)));
        const sorted = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const activeCount = docCounts.get(0) || 0;
        const hasMore = activeCount >= pageSize;
        onSuccess(sorted, hasMore);
      }, error => onError?.(error)));
    });
  });
  return () => { stopAuth(); stops.forEach(stop => stop()); };
}

export interface FetchPageResult {
  listings: Listing[];
  hasMore: boolean;
  lastVisibleCreatedAt?: string;
}

export async function fetchListingsPage(
  pageSize: number = 24,
  lastCreatedAt?: string,
  categoryId?: string
): Promise<FetchPageResult> {
  try {
    let q = query(
      collection(db, LISTINGS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (categoryId) {
      q = query(q, where('categoryId', '==', categoryId));
    }

    if (lastCreatedAt) {
      q = query(q, startAfter(lastCreatedAt));
    }

    q = query(q, limit(pageSize + 1));

    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const listings = pageDocs
      .map(d => readListing(d.data(), d.id))
      .filter((item): item is Listing => item !== null);

    const lastItem = listings[listings.length - 1];
    return {
      listings,
      hasMore,
      lastVisibleCreatedAt: lastItem?.createdAt
    };
  } catch (err) {
    console.error('fetchListingsPage failed:', err);
    return { listings: [], hasMore: false };
  }
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const snapshot = await getDoc(doc(db, LISTINGS_COLLECTION, id));
  return snapshot.exists() ? readListing(snapshot.data(), snapshot.id) : null;
}

export async function seedInitialListingsIfEmpty(fallbackListings: Listing[]): Promise<boolean> {
  try {
    if (!isCurrentAdmin()) return false;
    const existingSnap = await getDocs(query(collection(db, LISTINGS_COLLECTION), limit(1)));
    if (!existingSnap.empty) return false;
    const batch = writeBatch(db);
    fallbackListings.forEach((listing) => batch.set(doc(db, LISTINGS_COLLECTION, listing.id), stripUndefinedDeep(listing)));
    await batch.commit();
    return true;
  } catch (error) {
    console.warn('Could not seed listings to Firestore:', error);
    return false;
  }
}

export async function saveListingToDb(listing: Listing): Promise<void> {
  const listingRef = doc(db, LISTINGS_COLLECTION, listing.id);
  const existing = await getDoc(listingRef);
  const existingData = existing.exists() ? (existing.data() as Partial<Listing>) : {};
  const currentUser = auth.currentUser;
  const currentUid = currentUser?.uid;
  const isAdmin = isCurrentAdmin();

  if (!existing.exists() && !currentUid) {
    throw new Error('Authentication required to create a listing.');
  }

  const telegramFields = existingData.isPostedToTelegram ? {
    isPostedToTelegram: true,
    ...(existingData.telegramMessageId !== undefined ? { telegramMessageId: existingData.telegramMessageId } : {}),
    ...(existingData.telegramPostedAt !== undefined ? { telegramPostedAt: existingData.telegramPostedAt } : {})
  } : {};

  if (!existing.exists() && !isAdmin) {
    let autoApproveListings = false;
    try {
      const settingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, 'global_config'));
      if (settingsSnap.exists()) {
        autoApproveListings = (settingsSnap.data() as Partial<PlatformSettings>).autoApproveListings === true;
      }
    } catch {
      // Default to the current public behavior if settings cannot be read.
    }

    const safeSeller = {
      ...listing.seller,
      id: currentUid!,
      isVerified: false,
      rating: 0,
      activeAdsCount: Math.max(1, Number(listing.seller?.activeAdsCount || 1))
    };

    const safeListing: Listing = {
      ...listing,
      userId: currentUid!,
      seller: safeSeller,
      isVip: false,
      isTop: false,
      isPostedToTelegram: false,
      status: autoApproveListings ? 'active' : 'pending',
      viewsCount: 0
    };

    await setDoc(listingRef, stripUndefinedDeep(safeListing));
    Object.assign(listing, safeListing);
    return;
  }

  const data: Listing = {
    ...listing,
    ...telegramFields,
    ...(listing.userId ? {} : currentUid ? { userId: currentUid } : {})
  };
  await setDoc(listingRef, stripUndefinedDeep(data));
}

export async function updateListingInDb(listingId: string, updates: Partial<Listing>): Promise<void> {
  await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), stripUndefinedDeep(updates));
}

export async function deleteListingFromDb(listingId: string): Promise<void> {
  const snapshot = await getDoc(doc(db, LISTINGS_COLLECTION, listingId));
  if (!snapshot.exists()) return;
  const { deleteListingImages } = await import('./storage');
  // Delete the document first: a denied delete must never destroy its photos.
  await deleteDoc(snapshot.ref);
  await deleteListingImages(snapshot.data().images || [], snapshot.data().userId, listingId)
    .catch(() => console.warn('Listing deleted; image cleanup needs retry.'));
}

export async function incrementListingViewsInDb(listingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), { viewsCount: increment(1) });
  } catch (err) {
    console.warn('Failed to increment views in DB:', err);
  }
}

export function subscribeToConversations(onSuccess: (conversations: Conversation[]) => void, onError?: (err: Error) => void) {
  let unsubscribeSnapshot: (() => void) | null = null;
  let unsubscribeAuth: (() => void) | null = null;
  try {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = null;
      onSuccess([]); // Clear private data before switching account subscriptions.
      if (!user || user.isAnonymous) {
        return;
      }
      const participantQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        or(where('buyerId', '==', user.uid), where('sellerUserId', '==', user.uid)),
        // Sort after reading: no undeployed composite-index dependency or hidden chats.
      );
      unsubscribeSnapshot = onSnapshot(participantQuery, (snapshot) => {
        if (auth.currentUser?.uid !== user.uid) return;
        const items: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Conversation;
          const userUnread = data.unreadCountByUser?.[user.uid];
          items.push({ ...data, id: docSnap.id, unreadCount: typeof userUnread === 'number' ? userUnread : (data.unreadCount || 0) });
        });
        onSuccess(items.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)));
      }, (error) => {
        onSuccess([]);
        console.warn('Firestore conversations subscription error:', error);
        onError?.(error);
      });
    });
    return () => {
      unsubscribeSnapshot?.();
      unsubscribeAuth?.();
    };
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function seedConversationsIfEmpty(initialConversations: Conversation[]): Promise<void> {
  try {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid || !isCurrentAdmin()) return;
    const existingSnap = await getDocs(query(collection(db, CONVERSATIONS_COLLECTION), where('buyerId', '==', currentUid)));
    if (!existingSnap.empty) return;
    const batch = writeBatch(db);
    initialConversations.forEach((conv) => batch.set(doc(db, CONVERSATIONS_COLLECTION, conv.id), { ...conv, buyerId: conv.buyerId || currentUid }));
    await batch.commit();
  } catch (err) {
    console.warn('Failed to seed conversations:', err);
  }
}

export async function saveConversationToDb(conv: Conversation): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required to create a conversation.');

  let sellerUserId = conv.sellerUserId;
  if (conv.listingId) {
    try {
      const listingSnap = await getDoc(doc(db, LISTINGS_COLLECTION, conv.listingId));
      if (!listingSnap.exists() || listingSnap.data().status !== 'active') throw new Error('Listing unavailable.');
      sellerUserId = (listingSnap.data() as Listing).userId;
    } catch (err) {
      console.warn('Could not resolve seller UID for conversation:', err);
      throw err;
    }
  }

  if (!sellerUserId || sellerUserId === currentUid) {
    throw new Error('Cannot create a buyer conversation for this listing.');
  }

  const data: Conversation = {
    ...conv,
    buyerId: currentUid,
    sellerUserId,
    unreadCountByUser: { [currentUid]: 0, [sellerUserId]: conv.messages.length }
  };
  await setDoc(doc(db, CONVERSATIONS_COLLECTION, conv.id), stripUndefinedDeep(data));
}

export async function appendMessageInDb(chatId: string, newMessage: ChatMessage): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, chatId);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(conversationRef);
    if (!snapshot.exists()) throw new Error('Conversation not found.');
    const conv = snapshot.data() as Conversation;
    if (conv.buyerId !== uid && conv.sellerUserId !== uid) throw new Error('Not a participant.');
    if (conv.messages.some(m => m.id === newMessage.id)) return;
    const sender = conv.buyerId === uid ? 'buyer' : 'seller';
    const recipientId = sender === 'buyer' ? conv.sellerUserId : conv.buyerId;
    const message: ChatMessage = { ...newMessage, sender, text: newMessage.text.trim().slice(0, 2000) };
    if (!message.text) throw new Error('Empty message.');
    transaction.update(conversationRef, {
      messages: [...conv.messages, message], lastUpdated: message.timestamp,
      [`unreadCountByUser.${recipientId}`]: increment(1)
    });
    const notificationId = `msg-${chatId}-${message.id}`;
    transaction.set(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      id: notificationId, type: 'message', title: 'Yangi xabar',
      message: message.text.slice(0, 90), createdAt: message.timestamp,
      read: false, recipientId, listingId: conv.listingId, chatId
    });
  });
}

export async function markConversationReadInDb(chatId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), { [`unreadCountByUser.${uid}`]: 0 });
}

export function subscribeToNotifications(onSuccess: (notifications: AppNotification[]) => void, onError?: (err: Error) => void) {
  let unsubscribeSnapshot: (() => void) | null = null;
  let unsubscribeAuth: (() => void) | null = null;
  try {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = null;
      onSuccess([]); // Clear private data before switching account subscriptions.
      if (!user || user.isAnonymous) {
        return;
      }
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('recipientId', '==', user.uid));
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        if (auth.currentUser?.uid !== user.uid) return;
        const items: AppNotification[] = [];
        snapshot.forEach((snap) => items.push({ ...(snap.data() as AppNotification), id: snap.id }));
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onSuccess(items.slice(0, NOTIFICATIONS_REALTIME_LIMIT));
      }, (error) => {
        onSuccess([]);
        console.warn('Notifications subscription error:', error);
        onError?.(error);
      });
    });
    return () => {
      unsubscribeSnapshot?.();
      unsubscribeAuth?.();
    };
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true });
}

export async function markAllNotificationsRead(notifications: AppNotification[]): Promise<void> {
  const batch = writeBatch(db);
  notifications.filter(n => !n.read && n.id !== 'unread-messages-fallback').forEach(n => batch.update(doc(db, NOTIFICATIONS_COLLECTION, n.id), { read: true }));
  if (notifications.some(n => !n.read && n.id !== 'unread-messages-fallback')) await batch.commit();
}

export async function isSellerBlockedInDb(sellerUserId: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid || !sellerUserId) return false;
  const snap = await getDoc(doc(db, BLOCKED_SELLERS_COLLECTION, `${uid}_${sellerUserId}`));
  return snap.exists();
}

export async function blockSellerInDb(sellerUserId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || !sellerUserId || uid === sellerUserId) return;
  const blockRef = doc(db, BLOCKED_SELLERS_COLLECTION, `${uid}_${sellerUserId}`);
  if ((await getDoc(blockRef)).exists()) return;
  await setDoc(blockRef, {
    userId: uid,
    sellerUserId,
    createdAt: new Date().toISOString()
  });
}

export async function unblockSellerInDb(sellerUserId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || !sellerUserId) return;
  await deleteDoc(doc(db, BLOCKED_SELLERS_COLLECTION, `${uid}_${sellerUserId}`));
}

export async function saveNotificationToDb(notification: AppNotification): Promise<void> {
  await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id), notification);
}

export function subscribeToPlatformSettings(onSuccess: (settings: PlatformSettings) => void, onError?: (err: Error) => void) {
  try {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, 'global_config'), (docSnap) => {
      if (!docSnap.exists()) return;
      const rawSettings = docSnap.data() as PlatformSettings;
      const { telegramBotToken: _ignoredToken, ...safeSettings } = rawSettings as PlatformSettings & { telegramBotToken?: string };
      onSuccess(safeSettings as PlatformSettings);
    }, (err) => {
      console.warn('Platform settings subscription error:', err);
      onError?.(err);
    });
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function savePlatformSettingsToDb(settings: PlatformSettings): Promise<void> {
  const { telegramBotToken: _ignoredToken, ...publicSettings } = settings as PlatformSettings & { telegramBotToken?: string };
  const sanitizedSettings: PlatformSettings = {
    ...publicSettings,
    telegramChannelId: (settings.telegramChannelId || '').trim() || '@OSot_uz',
    telegramBotUsername: (settings.telegramBotUsername || '').trim().replace(/^@/, '') || 'OSotBot'
  };
  await setDoc(doc(db, SETTINGS_COLLECTION, 'global_config'), { ...sanitizedSettings, telegramBotToken: deleteField() }, { merge: true });
}

export function subscribeToModerationReports(onSuccess: (reports: ModerationReport[]) => void, onError?: (err: Error) => void) {
  try {
    return onSnapshot(collection(db, REPORTS_COLLECTION), (snapshot) => {
      const items: ModerationReport[] = [];
      snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as ModerationReport), id: docSnap.id }));
      onSuccess(items);
    }, (err) => {
      console.warn('Reports subscription error:', err);
      onError?.(err);
    });
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function saveReportToDb(report: ModerationReport): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required.');
  const safeReport: ModerationReport = { ...report, reporterId: currentUid };
  await setDoc(doc(db, REPORTS_COLLECTION, report.id), stripUndefinedDeep(safeReport));
}

export async function updateReportStatusInDb(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status });
}

export function subscribeToBlockedSellers(onSuccess: (ids: string[]) => void) {
  let stop: (() => void) | undefined;
  const stopAuth = onAuthStateChanged(auth, user => {
    stop?.();
    onSuccess([]);
    if (!user || user.isAnonymous) return;
    stop = onSnapshot(query(collection(db, BLOCKED_SELLERS_COLLECTION), where('userId', '==', user.uid)),
      snapshot => {
        if (auth.currentUser?.uid !== user.uid) return;
        onSuccess(snapshot.docs.map(d => d.data().sellerUserId).filter((id): id is string => typeof id === 'string'));
      }, () => onSuccess([]));
  });
  return () => { stop?.(); stopAuth(); };
}
