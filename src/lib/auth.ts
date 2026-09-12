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

export const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
export const ADMIN_EMAILS = ['fedya.ibragimovich@gmail.com'];

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
};

export const subscribeToAuth = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
export const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) => {
  // Keep the reset flow associated with the actual OldiSotti domain instead of
  // relying only on Firebase's default continue URL. The domain must be added
  // to Firebase Authentication > Settings > Authorized domains.
  const continueUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  auth.languageCode = 'uz';
  return sendPasswordResetEmail(
    auth,
    email.trim(),
    continueUrl
      ? {
          url: continueUrl,
          handleCodeInApp: false
        }
      : undefined
  );
};

export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logoutUser = async () => { await signOut(auth); return true; };
