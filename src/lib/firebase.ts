import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
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
  or
} from 'firebase/firestore';
import {
  Listing,
  Conversation,
  ChatMessage,
  PlatformSettings,
  ModerationReport
} from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const LISTINGS_COLLECTION = 'listings';
export const CONVERSATIONS_COLLECTION = 'conversations';
export const SETTINGS_COLLECTION = 'platform_settings';
export const REPORTS_COLLECTION = 'moderation_reports';

export function subscribeToListings(onSuccess: (listings: Listing[]) => void, onError?: (err: Error) => void) {
  try {
    return onSnapshot(collection(db, LISTINGS_COLLECTION), (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as Listing), id: docSnap.id }));
      onSuccess(items);
    }, (error) => {
      console.warn('Firestore listings subscription error:', error);
      onError?.(error);
    });
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function seedInitialListingsIfEmpty(fallbackListings: Listing[]): Promise<boolean> {
  try {
    const existingSnap = await getDocs(collection(db, LISTINGS_COLLECTION));
    if (!existingSnap.empty) return false;
    const batch = writeBatch(db);
    fallbackListings.forEach((listing) => batch.set(doc(db, LISTINGS_COLLECTION, listing.id), listing));
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
  const currentUid = auth.currentUser?.uid;

  // Telegram publishing happens asynchronously. If the Telegram update wins the
  // race and is followed by another save of the original listing object, never
  // overwrite the already-recorded publication status/message ID/timestamp.
  const telegramFields = existingData.isPostedToTelegram
    ? {
        isPostedToTelegram: true,
        ...(existingData.telegramMessageId !== undefined
          ? { telegramMessageId: existingData.telegramMessageId }
          : {}),
        ...(existingData.telegramPostedAt !== undefined
          ? { telegramPostedAt: existingData.telegramPostedAt }
          : {})
      }
    : {};

  const data: Listing = {
    ...listing,
    ...telegramFields,
    ...(listing.userId ? {} : currentUid ? { userId: currentUid } : {}),
    ...(listing.seller?.id === 'user-self' || listing.seller?.name === 'Fedya Ibragimovich'
      ? {}
      : currentUid && !existing.exists()
        ? { seller: { ...listing.seller, id: 'user-self' } }
        : {})
  };
  await setDoc(listingRef, data);
}

export async function updateListingInDb(listingId: string, updates: Partial<Listing>): Promise<void> {
  await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), updates);
}

export async function deleteListingFromDb(listingId: string): Promise<void> {
  await deleteDoc(doc(db, LISTINGS_COLLECTION, listingId));
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

      if (!user) {
        onSuccess([]);
        return;
      }

      const participantQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        or(
          where('buyerId', '==', user.uid),
          where('sellerUserId', '==', user.uid)
        )
      );

      unsubscribeSnapshot = onSnapshot(participantQuery, (snapshot) => {
        const items: Conversation[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as Conversation), id: docSnap.id }));
        onSuccess(items);
      }, (error) => {
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
    if (!currentUid) return;
    const existingSnap = await getDocs(
      query(collection(db, CONVERSATIONS_COLLECTION), where('buyerId', '==', currentUid))
    );
    if (!existingSnap.empty) return;
    const batch = writeBatch(db);
    initialConversations.forEach((conv) => {
      batch.set(doc(db, CONVERSATIONS_COLLECTION, conv.id), {
        ...conv,
        buyerId: conv.buyerId || currentUid
      });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Failed to seed conversations:', err);
  }
}

export async function saveConversationToDb(conv: Conversation): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required to create a conversation.');

  let sellerUserId = conv.sellerUserId;
  if (!sellerUserId && conv.listingId) {
    try {
      const listingSnap = await getDoc(doc(db, LISTINGS_COLLECTION, conv.listingId));
      if (listingSnap.exists()) {
        sellerUserId = (listingSnap.data() as Listing).userId;
      }
    } catch (err) {
      console.warn('Could not resolve seller UID for conversation:', err);
    }
  }

  const data: Conversation = {
    ...conv,
    buyerId: conv.buyerId || currentUid,
    ...(sellerUserId ? { sellerUserId } : {})
  };

  await setDoc(doc(db, CONVERSATIONS_COLLECTION, conv.id), data);
}

export async function appendMessageInDb(chatId: string, newMessage: ChatMessage, allMessages: ChatMessage[]): Promise<void> {
  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    messages: allMessages,
    lastUpdated: newMessage.timestamp,
    unreadCount: 0
  });
}

export function subscribeToPlatformSettings(onSuccess: (settings: PlatformSettings) => void, onError?: (err: Error) => void) {
  try {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, 'global_config'), (docSnap) => {
      if (docSnap.exists()) onSuccess(docSnap.data() as PlatformSettings);
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
  await setDoc(doc(db, SETTINGS_COLLECTION, 'global_config'), settings, { merge: true });
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
  await setDoc(doc(db, REPORTS_COLLECTION, report.id), report);
}

export async function updateReportStatusInDb(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status });
}