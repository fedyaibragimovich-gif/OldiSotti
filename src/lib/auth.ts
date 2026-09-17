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
import { normalizePhoneOtp, normalizeUzbekPhoneToE164 } from './phoneAuth';

export const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
export const ADMIN_EMAILS = ['fedya.ibragimovich@gmail.com'];

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
};

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
  return signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
  await signOut(auth);
  return true;
};

let appRecaptchaVerifier: RecaptchaVerifier | null = null;
let ownedRecaptchaContainer: HTMLElement | null = null;
let recaptchaContainerId: string | null = null;

const ensureRecaptchaContainer = (containerId: string) => {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById(containerId);
  if (existing) {
    recaptchaContainerId = containerId;
    if (existing.dataset.oldisotdiRecaptchaOwned === 'true') {
      ownedRecaptchaContainer = existing;
    }
    return;
  }

  const container = document.createElement('div');
  container.id = containerId;
  container.dataset.oldisotdiRecaptchaOwned = 'true';
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '1px';
  container.style.height = '1px';
  container.style.overflow = 'hidden';
  container.style.pointerEvents = 'none';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  ownedRecaptchaContainer = container;
  recaptchaContainerId = containerId;
};

export const clearRecaptcha = () => {
  if (appRecaptchaVerifier) {
    try {
      appRecaptchaVerifier.clear();
    } catch {
      // Firebase may already have disposed the widget.
    }
    appRecaptchaVerifier = null;
  }

  if (typeof document !== 'undefined') {
    const owned = ownedRecaptchaContainer;
    if (owned?.isConnected) {
      owned.remove();
    } else if (recaptchaContainerId) {
      const stale = document.getElementById(recaptchaContainerId);
      if (stale?.dataset.oldisotdiRecaptchaOwned === 'true') stale.remove();
    }
  }

  ownedRecaptchaContainer = null;
  recaptchaContainerId = null;
};

export const setupRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  clearRecaptcha();
  ensureRecaptchaContainer(containerId);
  auth.languageCode = 'uz';

  appRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // A new verifier will be created on the next send/resend attempt.
    }
  });

  return appRecaptchaVerifier;
};

export const sendPhoneVerificationCode = async (
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> => {
  await persistAuthSession();
  const normalizedPhone = normalizeUzbekPhoneToE164(phoneNumber);
  if (!normalizedPhone) {
    throw Object.assign(new Error('Uzbekistan phone number must contain 9 local digits.'), {
      code: 'auth/invalid-phone-number'
    });
  }

  const verifier = setupRecaptcha(containerId);
  try {
    return await signInWithPhoneNumber(auth, normalizedPhone, verifier);
  } finally {
    // reCAPTCHA is only needed while Firebase requests the SMS. Dispose it for
    // both success and failure so resend/change-number cannot reuse stale DOM.
    clearRecaptcha();
  }
};

export const confirmPhoneVerificationCode = async (
  confirmationResult: ConfirmationResult,
  verificationCode: string
) => {
  await persistAuthSession();
  const normalizedCode = normalizePhoneOtp(verificationCode);
  if (!normalizedCode) {
    throw Object.assign(new Error('Verification code must contain 6 digits.'), {
      code: 'auth/invalid-verification-code'
    });
  }
  return confirmationResult.confirm(normalizedCode);
};

export type { ConfirmationResult };
