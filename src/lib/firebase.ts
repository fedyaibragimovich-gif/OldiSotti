import { initializeApp, getApps, getApp } from 'firebase/app';
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
  orderBy,
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

// Initialize Firebase app singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const LISTINGS_COLLECTION = 'listings';
export const CONVERSATIONS_COLLECTION = 'conversations';
export const SETTINGS_COLLECTION = 'platform_settings';
export const REPORTS_COLLECTION = 'moderation_reports';

/**
 * Real-time listener for listings from Firestore
 */
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
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to attach listings listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seed initial mock listings to Firestore if collection is empty
 */
export async function seedInitialListingsIfEmpty(fallbackListings: Listing[]): Promise<boolean> {
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const existingSnap = await getDocs(listingsRef);
    if (!existingSnap.empty) {
      return false; // Already populated
    }

    // Populate using batch
    const batch = writeBatch(db);
    fallbackListings.forEach((listing) => {
      const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
      batch.set(docRef, listing);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.warn('Could not seed listings to Firestore (fallback to local state):', error);
    return false;
  }
}

/**
 * Add or overwrite listing in Firestore
 */
export async function saveListingToDb(listing: Listing): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
  await setDoc(docRef, listing);
}

/**
 * Update partial listing fields in Firestore
 */
export async function updateListingInDb(listingId: string, updates: Partial<Listing>): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(docRef, updates);
}

/**
 * Delete listing from Firestore
 */
export async function deleteListingFromDb(listingId: string): Promise<void> {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await deleteDoc(docRef);
}

/**
 * Increment listing view counter
 */
export async function incrementListingViewsInDb(listingId: string): Promise<void> {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, listingId);
    await updateDoc(docRef, {
      viewsCount: increment(1)
    });
  } catch (err) {
    // Non-blocking error
    console.warn('Failed to increment views in DB:', err);
  }
}

/**
 * Real-time listener for chat conversations
 */
export function subscribeToConversations(
  onSuccess: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const convRef = collection(db, CONVERSATIONS_COLLECTION);
    return onSnapshot(
      convRef,
      (snapshot) => {
        const items: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as Conversation), id: docSnap.id });
        });
        onSuccess(items);
      },
      (error) => {
        console.warn('Firestore conversations subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seed initial conversations if empty
 */
export async function seedConversationsIfEmpty(initialConversations: Conversation[]): Promise<void> {
  try {
    const convRef = collection(db, CONVERSATIONS_COLLECTION);
    const existingSnap = await getDocs(convRef);
    if (!existingSnap.empty) return;

    const batch = writeBatch(db);
    initialConversations.forEach((conv) => {
      const docRef = doc(db, CONVERSATIONS_COLLECTION, conv.id);
      batch.set(docRef, conv);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Failed to seed conversations:', err);
  }
}

/**
 * Save or update conversation
 */
export async function saveConversationToDb(conv: Conversation): Promise<void> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, conv.id);
  await setDoc(docRef, conv);
}

/**
 * Append message to conversation in Firestore
 */
export async function appendMessageInDb(chatId: string, newMessage: ChatMessage, allMessages: ChatMessage[]): Promise<void> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, chatId);
  await updateDoc(docRef, {
    messages: allMessages,
    lastUpdated: newMessage.timestamp,
    unreadCount: 0
  });
}

/**
 * Platform settings real-time listener
 */
export function subscribeToPlatformSettings(
  onSuccess: (settings: PlatformSettings) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global_config');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onSuccess(docSnap.data() as PlatformSettings);
        }
      },
      (err) => {
        console.warn('Platform settings subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Update platform settings
 */
export async function savePlatformSettingsToDb(settings: PlatformSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global_config');
  await setDoc(docRef, settings, { merge: true });
}

/**
 * Moderation reports real-time listener
 */
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
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Create a new moderation report
 */
export async function saveReportToDb(report: ModerationReport): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, report.id);
  await setDoc(docRef, report);
}

/**
 * Update report status
 */
export async function updateReportStatusInDb(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, { status });
}
