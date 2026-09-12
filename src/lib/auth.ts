import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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

const isMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  if (isMobileBrowser()) {
    await signInWithRedirect(auth, provider);
    return;
  }

  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
};

export const logoutUser = async () => {
  if (typeof window !== 'undefined') {
    const confirmed = window.confirm('Akkauntdan chiqmoqchimisiz?');
    if (!confirmed) return false;
  }
  await signOut(auth);
  return true;
};
