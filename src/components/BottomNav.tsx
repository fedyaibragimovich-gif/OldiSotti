import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  MessageSquare,
  Plus,
  Heart,
  User,
  Layers,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Mail,
  Lock,
  Chrome
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { subscribeToAuth, isAdminUser, loginWithEmail, registerWithEmail, loginWithGoogle, logoutUser, resetPassword } from '../lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface BottomNavProps {
  lang: Language;
  unreadCount: number;
  favoritesCount: number;
  onHomeClick: () => void;
  onMessagesClick: () => void;
  onPostAdClick: () => void;
  onFavoritesClick: () => void;
  onMyAdsClick: () => void;
  onOpenAdmin?: () => void;
}

const REMEMBERED_EMAIL_KEY = 'oldisotti_remembered_email';

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  lang,
  unreadCount,
  favoritesCount,
  onHomeClick,
  onMessagesClick,
  onPostAdClick,
  onFavoritesClick,
  onMyAdsClick,
  onOpenAdmin
}) => {
  const t = getTranslation(lang);
  const isKeyboardOpen = useVirtualKeyboard();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const authInFlight = useRef(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToAuth(setUser), []);

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // localStorage may be unavailable in private/restricted browsing modes.
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileModalOpen(false);
      }
    };
    if (profileModalOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileModalOpen]);

  const navLabels = {
    uz: { home: 'Asosiy', messages: 'Xabarlar', postAd: "E'lon", favorites: 'Saralangan', profile: 'Profil', myAds: "Mening e'lonlarim", logout: 'Chiqish', login: 'Kirish', register: "Ro'yxatdan o'tish" },
    ru: { home: 'Главная', messages: 'Сообщения', postAd: 'Подать', favorites: 'Избранное', profile: 'Профиль', myAds: 'Мои объявления', logout: 'Выйти', login: 'Войти', register: 'Регистрация' },
    oz: { home: 'Асосий', messages: 'Хабарлар', postAd: 'Эълон', favorites: 'Сараланган', profile: 'Профил', myAds: 'Менинг эълонларим', logout: 'Чиқиш', login: 'Кириш', register: 'Рўйхатдан ўтиш' }
  }[lang] || { home: 'Asosiy', messages: 'Xabarlar', postAd: "E'lon", favorites: 'Saralangan', profile: 'Profil', myAds: "Mening e'lonlarim", logout: 'Chiqish', login: 'Kirish', register: "Ro'yxatdan o'tish" };

  const friendlyAuthError = (error: any) => {
    const code = error?.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Email yoki parol noto‘g‘ri.';
    if (code.includes('email-already-in-use')) return 'Bu email allaqachon ro‘yxatdan o‘tgan.';
    if (code.includes('weak-password')) return 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.';
    if (code.includes('invalid-email')) return 'Email manzilini tekshiring.';
    if (code.includes('popup-blocked')) return 'Google oynasi bloklandi. Brauzerda popup oynalarga ruxsat bering va qayta bosing.';
    if (code.includes('unauthorized-domain')) return 'Bu sayt manzilida Google orqali kirishga ruxsat berilmagan. Asosiy sayt manzilidan kiring.';
    if (code.includes('operation-not-allowed')) return 'Google orqali kirish hozir sozlanmagan. Email orqali kiring.';
    if (code.includes('operation-not-supported') || code.includes('web-storage-unsupported')) return 'Saytni Chrome yoki Safari brauzerida ochib qayta urinib ko‘ring.';
    if (code.includes('network-request-failed')) return 'Internet aloqasini tekshiring va qayta urinib ko‘ring.';
    if (code.includes('account-exists-with-different-credential')) return 'Bu email boshqa kirish usuli bilan ro‘yxatdan o‘tgan. Avval o‘sha usul orqali kiring.';
    if (code.includes('too-many-requests')) return 'Juda ko‘p urinish bo‘ldi. Birozdan keyin qayta urinib ko‘ring.';
    if (code.includes('popup-closed')) return 'Google oynasi yopildi.';
    return 'Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.';
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError('');
    setForgotMessage('');
    setPassword('');
    if (mode === 'register') setEmail('');
    setProfileModalOpen(false);
    setAuthModalOpen(true);
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    setForgotMessage('');
    const normalizedEmail = email.trim();
    try {
      if (authMode === 'login') {
        if (rememberEmail) {
          try { window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail); } catch { /* ignore */ }
        } else {
          try { window.localStorage.removeItem(REMEMBERED_EMAIL_KEY); } catch { /* ignore */ }
        }
        await loginWithEmail(normalizedEmail, password);
      } else {
        await registerWithEmail(normalizedEmail, password);
      }
      setAuthModalOpen(false);
      setPassword('');
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (authInFlight.current) return;
    const normalizedEmail = email.trim();
    setAuthError('');
    setForgotMessage('');
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setAuthError('Avval to‘g‘ri email manzilingizni kiriting.');
      return;
    }
    authInFlight.current = true;
    setForgotLoading(true);
    try {
      await resetPassword(normalizedEmail);
      setForgotMessage('Parolni tiklash havolasi emailingizga yuborildi. Emailingizni tekshiring.');
    } catch (error: any) {
      const code = error?.code || '';
      if (code.includes('too-many-requests')) setAuthError('Juda ko‘p urinish bo‘ldi. Birozdan keyin qayta urinib ko‘ring.');
      else if (code.includes('invalid-email')) setAuthError('Email manzilini tekshiring.');
      else setAuthError('Parolni tiklashda xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      authInFlight.current = false;
      setForgotLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    setForgotMessage('');
    try {
      await loginWithGoogle();
      setAuthModalOpen(false);
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const loggedOut = await logoutUser();
      if (loggedOut) setProfileModalOpen(false);
    } catch {
      setAuthError('Chiqishda xatolik yuz berdi.');
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Foydalanuvchi';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {authModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black">{authMode === 'login' ? navLabels.login : navLabels.register}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">OldiSotdi akkauntingiz</p>
              </div>
              <button type="button" onClick={() => setAuthModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={submitAuth} className="space-y-3" autoComplete="on">
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={email} onChange={e => { setEmail(e.target.value); setForgotMessage(''); }} aria-label="Email" type="email" name="email" autoComplete="username email" required placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} aria-label={lang === 'ru' ? 'Пароль' : 'Parol'} type="password" name="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} required minLength={6} placeholder="Parol" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {authMode === 'login' && (
                <>
                  <label className="flex items-center gap-2 px-1 py-1 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={rememberEmail} onChange={e => setRememberEmail(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span>Emailni eslab qolish</span>
                  </label>
                  <button disabled={authLoading || forgotLoading} type="button" onClick={handleForgotPassword} className="w-full text-right text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-60 cursor-pointer">
                    {forgotLoading ? 'Yuborilmoqda…' : 'Parolni unutdingizmi?'}
                  </button>
                </>
              )}
              {authError && <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">{authError}</div>}
              {forgotMessage && <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{forgotMessage}</div>}
              <button disabled={authLoading || forgotLoading} type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-bold text-sm cursor-pointer">{authLoading ? 'Kutilmoqda…' : (authMode === 'login' ? navLabels.login : navLabels.register)}</button>
            </form>

            <div className="flex items-center gap-3 my-4"><div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /><span className="text-[11px] text-slate-400">yoki</span><div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
            <button disabled={authLoading || forgotLoading} type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer"><Chrome size={17} /> Google bilan davom etish</button>

            <p className="mt-3 text-center text-[10px] text-slate-400">Parolni saqlashni tasdiqlash oynasi brauzeringiz tomonidan ko‘rsatiladi.</p>
            <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setForgotMessage(''); }} className="w-full mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              {authMode === 'login' ? navLabels.register : navLabels.login}
            </button>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 transition-opacity">
          <div ref={profileRef} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-sm shadow-md">{initials}</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base truncate">{displayName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Akkauntga kiring'}</p>
                </div>
              </div>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>

            {!user ? (
              <div className="py-5 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">E'lon joylash, chat va shaxsiy funksiyalardan foydalanish uchun tizimga kiring.</p>
                <button type="button" onClick={() => openAuth('login')} className="w-full p-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 cursor-pointer">{navLabels.login}</button>
                <button type="button" onClick={() => openAuth('register')} className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">{navLabels.register}</button>
              </div>
            ) : (
              <>
                <div className="py-2.5 space-y-1">
                  <button type="button" id="bottom-profile-my-ads-btn" onClick={() => { setProfileModalOpen(false); onMyAdsClick(); }} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400"><Layers size={18} /></div><div className="text-left"><span className="font-bold text-sm block">{navLabels.myAds}</span><span className="text-[11px] text-slate-500 dark:text-slate-400">E'lonlarni boshqarish & VIP</span></div></div><ChevronRight size={16} className="text-slate-400" />
                  </button>

                  {onOpenAdmin && isAdminUser(user) && (
                    <button type="button" id="bottom-profile-admin-btn" onClick={() => { setProfileModalOpen(false); onOpenAdmin(); }} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300"><ShieldCheck size={18} /></div><div className="text-left"><div className="flex items-center gap-1.5"><span className="font-bold text-sm block">{t.adminPanel}</span><span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-600 text-white rounded-md">PRO</span></div><span className="text-[11px] text-slate-500 dark:text-slate-400">Moderatsiya & Tizim tahlili</span></div></div><ChevronRight size={16} className="text-slate-400" />
                    </button>
                  )}

                  <button type="button" id="bottom-profile-messages-btn" onClick={() => { setProfileModalOpen(false); onMessagesClick(); }} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400"><MessageSquare size={18} /></div><div className="text-left"><span className="font-bold text-sm block">{navLabels.messages}</span><span className="text-[11px] text-slate-500 dark:text-slate-400">Xaridorlar bilan yozishmalar</span></div></div><div className="flex items-center gap-2">{unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">{unreadCount}</span>}<ChevronRight size={16} className="text-slate-400" /></div>
                  </button>

                  <button type="button" id="bottom-profile-favorites-btn" onClick={() => { setProfileModalOpen(false); onFavoritesClick(); }} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-500"><Heart size={18} className="fill-rose-500" /></div><div className="text-left"><span className="font-bold text-sm block">{navLabels.favorites}</span><span className="text-[11px] text-slate-500 dark:text-slate-400">Saqlangan qiziqarli e'lonlar</span></div></div><div className="flex items-center gap-2">{favoritesCount > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">{favoritesCount}</span>}<ChevronRight size={16} className="text-slate-400" /></div>
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"><LogOut size={15} /><span>{navLabels.logout}</span></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav id="bottom-navigation-dock" aria-label="Pastki asosiy menyu" style={{ display: isKeyboardOpen ? 'none' : undefined }} className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-all duration-200 transform-gpu ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-xl mx-auto px-2 sm:px-6 h-16 flex items-center justify-between relative">
          <button id="bottom-nav-home-btn" type="button" onClick={onHomeClick} className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"><Home size={20} className="group-hover:scale-110 transition-transform" /><span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">{navLabels.home}</span></button>
          <button id="bottom-nav-messages-btn" type="button" onClick={onMessagesClick} className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group relative"><div className="relative"><MessageSquare size={20} className="group-hover:scale-110 transition-transform" />{unreadCount > 0 && <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-black px-1 shadow-xs animate-pulse">{unreadCount}</span>}</div><span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">{navLabels.messages}</span></button>
          <div className="flex-1 flex items-center justify-center"><button id="bottom-nav-post-ad-btn" type="button" onClick={onPostAdClick} className="group relative -top-3 sm:-top-3.5 flex flex-col items-center justify-center cursor-pointer focus:outline-none" title="Yangi e'lon berish" aria-label="Yangi e'lon berish"><div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/35 border-3 sm:border-4 border-white dark:border-slate-900 group-hover:scale-110 group-active:scale-95 transition-all duration-200"><Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-200" /></div><span className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-tight">{navLabels.postAd}</span></button></div>
          <button id="bottom-nav-favorites-btn" type="button" onClick={onFavoritesClick} className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer group relative"><div className="relative"><Heart size={20} className={`group-hover:scale-110 transition-transform ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />{favoritesCount > 0 && <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black px-1 shadow-xs">{favoritesCount}</span>}</div><span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">{navLabels.favorites}</span></button>
          <button id="bottom-nav-profile-btn" type="button" onClick={() => setProfileModalOpen(true)} className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black border border-indigo-200 dark:border-indigo-800 group-hover:scale-110 transition-transform">{user ? initials : <User size={12} />}</div><span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">{navLabels.profile}</span></button>
        </div>
      </nav>
    </>
  );
});
