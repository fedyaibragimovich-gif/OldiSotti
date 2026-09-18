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
  ConfirmationResult,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase';
import {
  normalizePhoneOtp,
  normalizeUzbekPhoneToE164,
  phoneToPasswordEmail
} from './phoneAuth';

export const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
export const ADMIN_EMAILS = ['fedya.ibragimovich@gmail.com'];

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  return Boolean(user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
};

const makeAuthError = (code: string, message: string) => Object.assign(new Error(message), { code });

// Prefer durable browser-local persistence for every sign-in flow. This keeps
// users signed in across browser/app restarts. Restricted browsers still get
// the safest available fallback.
const persistAuthSession = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    return;
  } catch {
    // Some privacy/restricted browser modes do not allow durable local storage.
  }

  try {
    await setPersistence(auth, browserSessionPersistence);
    return;
  } catch {
    // Fall through to in-memory persistence as a last resort.
  }

  await setPersistence(auth, inMemoryPersistence);
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

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Start the popup synchronously during the click. Awaiting storage setup
  // first can consume mobile Chrome's transient user activation.
  const popupResult = signInWithPopup(auth, provider);
  const credential = await popupResult;
  try {
    await persistAuthSession();
  } catch {
    // A successful Google sign-in must not be reported as failed solely
    // because the browser restricts persistence.
  }
  return credential;
};

export const logoutUser = async () => {
  await signOut(auth);
  return true;
};

export const loginWithPhonePassword = async (phoneNumber: string, password: string) => {
  await persistAuthSession();
  const normalizedPhone = normalizeUzbekPhoneToE164(phoneNumber);
  if (!normalizedPhone) {
    throw makeAuthError('auth/invalid-phone-number', 'Uzbekistan phone number must contain 9 local digits.');
  }
  if (password.length < 6) {
    throw makeAuthError('auth/weak-password', 'Password must contain at least 6 characters.');
  }

  const passwordEmail = phoneToPasswordEmail(normalizedPhone);
  if (!passwordEmail) {
    throw makeAuthError('auth/invalid-phone-number', 'Unable to create phone sign-in identifier.');
  }

  return signInWithEmailAndPassword(auth, passwordEmail, password);
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
    throw makeAuthError('auth/invalid-phone-number', 'Uzbekistan phone number must contain 9 local digits.');
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
    throw makeAuthError('auth/invalid-verification-code', 'Verification code must contain 6 digits.');
  }
  return confirmationResult.confirm(normalizedCode);
};

// Registration/password recovery flow:
// 1. Firebase verifies ownership of the +998 number through SMS.
// 2. The verified phone user is linked to a deterministic internal email alias
//    and Firebase's password provider. The alias is never shown to the user.
// 3. Future sign-ins use phone + password without sending another SMS.
// Existing legacy phone-only users are upgraded after a successful OTP.
export const confirmPhoneAndSetPassword = async (
  confirmationResult: ConfirmationResult,
  verificationCode: string,
  phoneNumber: string,
  password: string
) => {
  await persistAuthSession();

  const normalizedPhone = normalizeUzbekPhoneToE164(phoneNumber);
  if (!normalizedPhone) {
    throw makeAuthError('auth/invalid-phone-number', 'Uzbekistan phone number must contain 9 local digits.');
  }
  const normalizedCode = normalizePhoneOtp(verificationCode);
  if (!normalizedCode) {
    throw makeAuthError('auth/invalid-verification-code', 'Verification code must contain 6 digits.');
  }
  if (password.length < 6) {
    throw makeAuthError('auth/weak-password', 'Password must contain at least 6 characters.');
  }

  const credential = await confirmationResult.confirm(normalizedCode);
  const user = credential.user;
  if (user.phoneNumber && user.phoneNumber !== normalizedPhone) {
    throw makeAuthError('auth/phone-number-mismatch', 'Verified phone number does not match the requested number.');
  }

  const passwordEmail = phoneToPasswordEmail(normalizedPhone);
  if (!passwordEmail) {
    throw makeAuthError('auth/invalid-phone-number', 'Unable to create phone sign-in identifier.');
  }

  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === 'password');
  if (hasPasswordProvider) {
    if (user.email && user.email.toLowerCase() !== passwordEmail.toLowerCase()) {
      throw makeAuthError(
        'auth/phone-password-conflict',
        'This phone account already has a different password identity.'
      );
    }
    await updatePassword(user, password);
  } else {
    const passwordCredential = EmailAuthProvider.credential(passwordEmail, password);
    await linkWithCredential(user, passwordCredential);
  }

  return credential;
};

export type { ConfirmationResult };
