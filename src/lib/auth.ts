import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

/**
 * Creates a stable Firebase identity for each browser session.
 * This is intentionally anonymous for the first security phase; it gives
 * Firestore rules a real UID without exposing credentials in the client.
 * The anonymous account can later be linked to email/password or another
 * provider without changing listing ownership.
 */
export async function ensureAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    console.error('Firebase anonymous authentication failed:', error);
    return null;
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
