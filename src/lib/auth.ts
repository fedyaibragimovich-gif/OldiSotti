import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

/** Creates a temporary Firebase identity for first-time visitors. */
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

/** Registers the current anonymous user as an email/password account. */
export async function registerWithEmail(email: string, password: string) {
  const currentUser = auth.currentUser;
  if (currentUser?.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    return linkWithCredential(currentUser, credential);
  }
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Signs an existing user in with email and password. */
export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
