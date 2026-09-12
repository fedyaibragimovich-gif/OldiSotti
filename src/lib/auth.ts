import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export const ADMIN_UID = 'Q81AQDKw7GXYNgdrnp2qvYgyS02';
export const ADMIN_EMAILS = ['fedya.ibragimovich@gmail.com'];

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
};

export const subscribeToAuth = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
export const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logoutUser = async () => { await signOut(auth); return true; };
