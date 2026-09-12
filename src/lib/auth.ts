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
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logoutUser = async () => { await signOut(auth); return true; };

// The login form lives in BottomNav.tsx. Keep the reset action available
// even when that component is not directly edited by this deployment patch.
const installForgotPasswordButton = () => {
  if (typeof window === 'undefined') return;
  const attach = () => {
    const passwordInput = document.querySelector<HTMLInputElement>('input[type="password"]');
    if (!passwordInput) return;
    const modal = passwordInput.closest('div.fixed.inset-0');
    if (!modal) return;
    const buttons = Array.from(modal.querySelectorAll('button'));
    const googleButton = buttons.find(button => (button.textContent || '').toLowerCase().includes('google'));
    if (!googleButton) return;
    const heading = modal.querySelector('h3')?.textContent?.toLowerCase() || '';
    const isLogin = heading.includes('kirish') || heading.includes('войти') || heading.includes('кириш');
    const existing = modal.querySelector('[data-forgot-password="true"]');
    if (!isLogin) { existing?.remove(); return; }
    if (existing) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-forgot-password', 'true');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:-4px;';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Parolni unutdingizmi?';
    button.style.cssText = 'width:100%;text-align:right;border:0;background:transparent;color:#4f46e5;font-size:12px;font-weight:600;cursor:pointer;padding:2px 0;';
    const message = document.createElement('div');
    message.style.cssText = 'display:none;border-radius:12px;padding:10px 12px;font-size:12px;font-weight:600;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;';

    button.addEventListener('click', async () => {
      const emailInput = modal.querySelector<HTMLInputElement>('input[type="email"]');
      const email = emailInput?.value.trim() || '';
      message.style.display = 'none';
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        message.textContent = 'Avval to‘g‘ri email manzilingizni kiriting.';
        message.style.display = 'block';
        message.style.background = '#fff7ed';
        message.style.color = '#c2410c';
        message.style.borderColor = '#fed7aa';
        return;
      }
      button.disabled = true;
      button.textContent = 'Yuborilmoqda…';
      try {
        await resetPassword(email);
        message.textContent = 'Parolni tiklash havolasi emailingizga yuborildi. Emailingizni tekshiring.';
        message.style.display = 'block';
        message.style.background = '#ecfdf5';
        message.style.color = '#047857';
        message.style.borderColor = '#a7f3d0';
      } catch (error: any) {
        const code = error?.code || '';
        message.textContent = code.includes('too-many-requests') ? 'Juda ko‘p urinish bo‘ldi. Birozdan keyin qayta urinib ko‘ring.' : code.includes('invalid-email') ? 'Email manzilini tekshiring.' : 'Parolni tiklashda xatolik yuz berdi. Qayta urinib ko‘ring.';
        message.style.display = 'block';
        message.style.background = '#fff1f2';
        message.style.color = '#be123c';
        message.style.borderColor = '#fecdd3';
      } finally {
        button.disabled = false;
        button.textContent = 'Parolni unutdingizmi?';
      }
    });
    wrapper.appendChild(button);
    wrapper.appendChild(message);
    passwordInput.parentElement?.insertAdjacentElement('afterend', wrapper);
  };
  const start = () => {
    if (!document.body) { window.setTimeout(start, 100); return; }
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    attach();
  };
  start();
};
installForgotPasswordButton();
