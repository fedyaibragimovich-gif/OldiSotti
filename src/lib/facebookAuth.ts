import {
  FacebookAuthProvider,
  signInWithCredential,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  type UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Public Meta App ID only. The App Secret and Facebook access tokens must never
// be embedded in the site or written to logs/browser storage.
const FACEBOOK_APP_ID = '1760421308531409';
const FACEBOOK_SDK_URL = 'https://connect.facebook.net/en_US/sdk.js';

type FacebookLoginResponse = {
  authResponse?: { accessToken?: string };
};

type FacebookSdk = {
  init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  login(callback: (response: FacebookLoginResponse) => void, options: { scope: string }): void;
};

type FacebookWindow = Window & {
  FB?: FacebookSdk;
  fbAsyncInit?: () => void;
};

let sdkInitialized = false;
let sdkLoading: Promise<FacebookSdk> | null = null;

const facebookError = (code: string, message: string) => Object.assign(new Error(message), { code });

// Preload only after the user opens the login dialog, never on every page view.
// FB.login itself MUST run synchronously within the user's Facebook button click.
function preloadFacebookSdk(): Promise<FacebookSdk> {
  if (typeof window === 'undefined') {
    return Promise.reject(facebookError('auth/operation-not-supported-in-this-environment', 'Facebook login requires a browser.'));
  }
  const browser = window as FacebookWindow;
  if (sdkInitialized && browser.FB) return Promise.resolve(browser.FB);
  if (sdkLoading) return sdkLoading;

  sdkLoading = new Promise<FacebookSdk>((resolve, reject) => {
    let finished = false;
    const timeout = window.setTimeout(() => fail(), 20000);
    const fail = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      reject(facebookError('auth/facebook-sdk-unavailable', 'Facebook SDK could not load.'));
    };
    const originalInit = browser.fbAsyncInit;
    browser.fbAsyncInit = () => {
      if (finished) return;
      try {
        originalInit?.();
        if (!browser.FB) return fail();
        browser.FB.init({ appId: FACEBOOK_APP_ID, cookie: false, xfbml: false, version: 'v23.0' });
        sdkInitialized = true;
        finished = true;
        window.clearTimeout(timeout);
        resolve(browser.FB);
      } catch {
        fail();
      }
    };
    const script = document.createElement('script');
    script.src = FACEBOOK_SDK_URL;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => {
    sdkLoading = null;
    throw error;
  });
  return sdkLoading;
}

function prepareFacebookSdkWhenLoginOpens() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
  const preload = () => {
    if (!document.getElementById('auth-facebook-btn')) return false;
    void preloadFacebookSdk().catch(() => { /* A retry will surface a sign-in error. */ });
    return true;
  };
  if (preload()) return;
  const observer = new MutationObserver(() => {
    if (preload()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  prepareFacebookSdkWhenLoginOpens();
}

function signInWithFacebookSdk(): Promise<UserCredential> {
  const sdk = (window as FacebookWindow).FB;
  if (!sdkInitialized || !sdk) {
    void preloadFacebookSdk().catch(() => { /* User can retry after SDK loads. */ });
    return Promise.reject(facebookError('auth/facebook-sdk-not-ready', 'Facebook login is loading. Please retry in a few seconds.'));
  }

  // This bypasses Firebase's OAuth popup helper and its missing-initial-state
  // sessionStorage round-trip on affected mobile browsers.
  return new Promise<UserCredential>((resolve, reject) => {
    try {
      sdk.login(response => {
        const token = response?.authResponse?.accessToken;
        if (!token) {
          reject(facebookError('auth/facebook-login-cancelled', 'Facebook login was cancelled or did not return a credential.'));
          return;
        }
        void signInWithCredential(auth, FacebookAuthProvider.credential(token)).then(resolve, reject);
      }, { scope: 'public_profile,email' });
    } catch (error) {
      reject(error);
    }
  });
}

export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');

  // Keep the existing desktop flow unchanged. On mobile, use Meta's JS SDK to
  // exchange a Facebook credential directly with Firebase, without /__/auth/handler.
  // Requires Facebook Login > Settings > Login with the JavaScript SDK = Yes,
  // and https://oldi-sotdi.uz in Allowed Domains for the JavaScript SDK.
  const mobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const signInResult = mobile ? signInWithFacebookSdk() : signInWithPopup(auth, provider);
  const credential = await signInResult;

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      try {
        await setPersistence(auth, inMemoryPersistence);
      } catch {
        // Don't mark an already successful sign-in as failed if storage is blocked.
      }
    }
  }

  return credential;
};
