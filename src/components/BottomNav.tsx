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
  Loader2
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { subscribeToAuth, isAdminUser, logoutUser } from '../lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { AuthModal } from './AuthModal';

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
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

const isInternalPhonePasswordEmail = (email?: string | null) =>
  Boolean(email && /^phone-998\d{9}@auth\.oldi-sotdi\.uz$/i.test(email));

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  lang,
  unreadCount,
  favoritesCount,
  onHomeClick,
  onMessagesClick,
  onPostAdClick,
  onFavoritesClick,
  onMyAdsClick,
  onOpenAdmin,
  onOpenAuth
}) => {
  const t = getTranslation(lang);
  const isKeyboardOpen = useVirtualKeyboard();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToAuth(setUser), []);

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

  const openAuth = (mode: 'login' | 'register') => {
    setProfileModalOpen(false);
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setAuthMode(mode);
      setAuthModalOpen(true);
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setProfileModalOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const safeEmail = user?.email && !isInternalPhonePasswordEmail(user.email) ? user.email : null;
  const accountIdentifier = user?.phoneNumber || safeEmail || '';
  const displayName = user?.displayName || (user?.phoneNumber ? 'Foydalanuvchi' : safeEmail?.split('@')[0]) || 'Foydalanuvchi';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {!onOpenAuth && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          lang={lang}
          initialMode={authMode}
        />
      )}

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 transition-opacity">
          <div ref={profileRef} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-sm shadow-md">{initials}</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base truncate">{displayName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{accountIdentifier || 'Akkauntga kiring'}</p>
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
                  <button
                    type="button"
                    id="bottom-profile-logout-btn"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                    <span>{isLoggingOut ? (lang === 'ru' ? 'Выход...' : lang === 'oz' ? 'Чиқилмоқда...' : 'Chiqilmoqda...') : navLabels.logout}</span>
                  </button>
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
