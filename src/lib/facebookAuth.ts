import {
  FacebookAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { auth } from './firebase';

// OAuth credentials are configured only in Firebase Console. Never embed a
// Meta App Secret or Facebook access token in the client.
export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');

  // IMPORTANT: start the popup synchronously from the user's click handler.
  // Awaiting setPersistence() first can lose the browser's transient user
  // activation and leave Facebook sign-in blocked in mobile/custom tabs.
  // Firebase Web Auth already defaults to durable local persistence where
  // available; explicitly reinforce it after successful sign-in instead.
  const popupResult = signInWithPopup(auth, provider);
  const credential = await popupResult;

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      // A successful sign-in must not fail simply because storage is disabled.
      try {
        await setPersistence(auth, inMemoryPersistence);
      } catch {
        // Keep Firebase's existing persistence choice if none is supported.
      }
    }
  }

  return credential;
};
