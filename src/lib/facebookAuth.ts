import {
  FacebookAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { auth } from './firebase';

// Facebook OAuth credentials are configured in Firebase Console, not in source.
// Never embed the Meta App Secret or Facebook access tokens in frontend code.
export const loginWithFacebook = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      await setPersistence(auth, inMemoryPersistence);
    }
  }

  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  return signInWithPopup(auth, provider);
};
