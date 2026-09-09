import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  increment
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

function requireAuthenticatedUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Foydalanuvchi autentifikatsiya qilinmagan.');
  return uid;
}

/** Real-time public listings feed. */
export function subscribeToListings(
  onSuccess: (listings: Listing[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    return onSnapshot(
      listingsRef,
      (snapshot) => {
        const items: Listing[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as Listing), id: docSnap.id });
        });
        onSuccess(items);
      },
      (error) => {
        console.warn('Firestore listings subscription error:', error);
        onError?.(error);
      }
    );
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

/** Seed only once, assigning ownership to the authenticated migration user. */
export async function seedInitialListingsIfEmpty(fallbackListings: Listing[]): Promise<boolean> {
  try {
    const uid = requireAuthenticatedUid();
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const existingSnap = await getDocs(listingsRef);
    if (!existingSnap.empty) return false;

    const batch = writeBatch(db);
    fallbackListings.forEach((listing) => {
      const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
      batch.set(docRef, { ...listing, ownerId: listing.ownerId || uid });
    });
    await batch.commit();
    return true;
  } catch (error) {
    console.warn('Could not seed listings to Firestore:', error);
    return false;
  }
}

/** Create/replace a listing while binding it to the current Firebase UID. */
export async function saveListingToDb(listing: Listing): Promise<void> {
  const uid = requireAuthenticatedUid();
  const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
  await setDoc(docRef, { ...listing, ownerId: uid });
}

/** Update listing fields without allowing the client to change ownership. */
export async function updateListingInDb(listingId: string, updates: Partial<Listing>): Promise<void> {
  requireAuthenticatedUid();
  const { ownerId: _ignoredOwnerId, ...safeUpdates } = updates as Partial<Listing>;
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(docRef, safeUpdates);
}

export async function deleteListingFromDb(listingId: string): Promise<void> {
  requireAuthenticatedUid();
  await deleteDoc(doc(db, LISTINGS_COLLECTION, listingId));
}

export async function incrementListingViewsInDb(listingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), { viewsCount: increment(1) });
  } catch (err) {
    console.warn('Failed to increment views in DB:', err);
  }
}

/** Subscribe only to conversations where the current user is a participant. */
export function subscribeToConversations(
  onSuccess: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const uid = requireAuthenticatedUid();
    const convQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participantIds', 'array-contains', uid)
    );
    return onSnapshot(
      convQuery,
      (snapshot) => {
        const items: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as Conversation), id: docSnap.id });
        });
        onSuccess(items);
      },
      (error) => {
        console.warn('Firestore conversations subscription error:', error);
        onError?.(error);
      }
    );
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function seedConversationsIfEmpty(initialConversations: Conversation[]): Promise<void> {
  try {
    const uid = requireAuthenticatedUid();
    const convRef = collection(db, CONVERSATIONS_COLLECTION);
    const existingSnap = await getDocs(query(convRef, where('participantIds', 'array-contains', uid)));
    if (!existingSnap.empty) return;

    const batch = writeBatch(db);
    initialConversations.forEach((conv) => {
      const docRef = doc(db, CONVERSATIONS_COLLECTION, conv.id);
      batch.set(docRef, {
        ...conv,
        participantIds: Array.from(new Set([...(conv.participantIds || []), uid]))
      });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Failed to seed conversations:', err);
  }
}

export async function saveConversationToDb(conv: Conversation): Promise<void> {
  const uid = requireAuthenticatedUid();
  const docRef = doc(db, CONVERSATIONS_COLLECTION, conv.id);
  await setDoc(docRef, {
    ...conv,
    participantIds: Array.from(new Set([...(conv.participantIds || []), uid]))
  });
}

export async function appendMessageInDb(chatId: string, newMessage: ChatMessage, allMessages: ChatMessage[]): Promise<void> {
  requireAuthenticatedUid();
  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    messages: allMessages,
    lastUpdated: newMessage.timestamp,
    unreadCount: 0
  });
}

/** Platform settings are admin-only. */
export function subscribeToPlatformSettings(
  onSuccess: (settings: PlatformSettings) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global_config');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) onSuccess(docSnap.data() as PlatformSettings);
      },
      (err) => {
        console.warn('Platform settings subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function savePlatformSettingsToDb(settings: PlatformSettings): Promise<void> {
  requireAuthenticatedUid();
  const docRef = doc(db, SETTINGS_COLLECTION, 'global_config');
  await setDoc(docRef, settings, { merge: true });
}

/** Moderation reports are readable/writable only by authorized users under Firestore rules. */
export function subscribeToModerationReports(
  onSuccess: (reports: ModerationReport[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    return onSnapshot(
      reportsRef,
      (snapshot) => {
        const items: ModerationReport[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as ModerationReport), id: docSnap.id });
        });
        onSuccess(items);
      },
      (err) => {
        console.warn('Reports subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

export async function saveReportToDb(report: ModerationReport): Promise<void> {
  requireAuthenticatedUid();
  await setDoc(doc(db, REPORTS_COLLECTION, report.id), report);
}

export async function updateReportStatusInDb(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  requireAuthenticatedUid();
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status });
}
