import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// OldiSotti super-admin Firebase Auth UID.
export const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';

export const isAdminUser = (user: User | null): boolean => {
  return user?.uid === ADMIN_UID;
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const logoutUser = () => signOut(auth);
