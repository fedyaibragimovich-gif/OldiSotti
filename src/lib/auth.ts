import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from './firebase';

export const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
export const ADMIN_EMAILS = ['fedya.ibragimovich@gmail.com'];

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
};

// Configure storage on startup, before the user clicks a sign-in button.
const persistenceReady = (async () => {
  for (const persistence of [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]) {
    try {
      await setPersistence(auth, persistence);
      return;
    } catch {
      // Restricted browsers may only support a session held in memory.
    }
  }
})();
const persistAuthSession = () => persistenceReady;

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
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (active) callback(user);
  });

  void restoreRedirectSession().then(() => {
    if (active) callback(auth.currentUser);
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

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Keep the popup call in the click handler's user activation. Firebase queues
  // the pending persistence operation internally. Cross-site redirect is not a
  // reliable fallback when browsers block third-party storage.
  return signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
  await signOut(auth);
  return true;
};

let appRecaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  if (appRecaptchaVerifier) {
    try {
      appRecaptchaVerifier.clear();
    } catch {
      // ignore
    }
    appRecaptchaVerifier = null;
  }

  auth.languageCode = 'uz';

  appRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Response expired
    }
  });

  return appRecaptchaVerifier;
};

export const clearRecaptcha = () => {
  if (appRecaptchaVerifier) {
    try {
      appRecaptchaVerifier.clear();
    } catch {
      // ignore
    }
    appRecaptchaVerifier = null;
  }
};

export const sendPhoneVerificationCode = async (
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> => {
  await persistAuthSession();
  const verifier = setupRecaptcha(containerId);
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

export const confirmPhoneVerificationCode = async (
  confirmationResult: ConfirmationResult,
  verificationCode: string
) => {
  await persistAuthSession();
  return confirmationResult.confirm(verificationCode);
};

export type { ConfirmationResult };

