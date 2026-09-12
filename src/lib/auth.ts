import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
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

const persistAuthSession = async () => {
  await setPersistence(auth, browserLocalPersistence);
};

let redirectRestorePromise: Promise<void> | null = null;

const restoreRedirectSession = () => {
  if (!redirectRestorePromise) {
    redirectRestorePromise = (async () => {
      await persistAuthSession();
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.warn('Google redirect sign-in restore failed:', error);
      }
      await auth.authStateReady();
    })();
  }
  return redirectRestorePromise;
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  let active = true;
  let unsubscribe = () => {};

  void restoreRedirectSession().finally(() => {
    if (!active) return;
    callback(auth.currentUser);
    unsubscribe = onAuthStateChanged(auth, callback);
  });

  return () => {
    active = false;
    unsubscribe();
  };
};

export const loginWithEmail = async (email: string, password: string) => {
  await persistAuthSession();
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  await persistAuthSession();
  return createUserWithEmailAndPassword(auth, email, password);
};

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
  await persistAuthSession();

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
