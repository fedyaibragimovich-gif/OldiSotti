import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  MessageSquare,
  Plus,
  Heart,
  Layers,
  LogIn,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { AuthModal } from './AuthModal';
import { auth, ensureAnonymousAuth, logout, subscribeToAuthState } from '../lib/auth';

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
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToAuthState(setCurrentUser), []);

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
    uz: {
      home: 'Asosiy', messages: 'Xabarlar', postAd: "E'lon", favorites: 'Saralangan',
      profile: 'Profil', myAds: "Mening e'lonlarim", login: 'Kirish', logout: 'Chiqish'
    },
    ru: {
      home: 'Главная', messages: 'Сообщения', postAd: 'Подать', favorites: 'Избранное',
      profile: 'Профиль', myAds: 'Мои объявления', login: 'Войти', logout: 'Выйти'
    },
    oz: {
      home: 'Асосий', messages: 'Хабарлар', postAd: 'Эълон', favorites: 'Сараланган',
      profile: 'Профил', myAds: 'Менинг эълонларим', login: 'Кириш', logout: 'Чиқиш'
    }
  }[lang] || {
    home: 'Asosiy', messages: 'Xabarlar', postAd: "E'lon", favorites: 'Saralangan',
    profile: 'Profil', myAds: "Mening e'lonlarim", login: 'Kirish', logout: 'Chiqish'
  };

  const isRegistered = !!currentUser && !currentUser.isAnonymous;
  const initials = isRegistered
    ? (currentUser?.email?.slice(0, 2).toUpperCase() || 'U')
    : 'G';

  const handleLogout = async () => {
    try {
      await logout();
      await ensureAnonymousAuth();
      setProfileModalOpen(false);
    } catch (error) {
      console.error('Firebase logout failed:', error);
    }
  };

  const openAuth = () => {
    setProfileModalOpen(false);
    setAuthModalOpen(true);
  };

  return (
    <>
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 transition-opacity sm:items-center sm:p-4">
          <div
            ref={profileRef}
            className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-sm font-black text-white shadow-md">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold leading-tight">
                    {isRegistered ? 'OldiSotti foydalanuvchisi' : 'Mehmon foydalanuvchi'}
                  </h4>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {isRegistered ? currentUser?.email : 'Akkauntga kirmagansiz'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            {!isRegistered && (
              <div className="my-3 rounded-2xl bg-indigo-50 p-3 dark:bg-indigo-950/40">
                <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                  E'lonlaringizni saqlash va boshqa qurilmadan kirish uchun akkaunt yarating.
                </p>
                <button
                  type="button"
                  onClick={openAuth}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white hover:bg-indigo-500"
                >
                  <LogIn size={15} /> {navLabels.login}
                </button>
              </div>
            )}

            <div className="space-y-1 py-2.5">
              <button type="button" onClick={() => { setProfileModalOpen(false); onMyAdsClick(); }} className="group flex w-full items-center justify-between rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400"><Layers size={18} /></div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">{navLabels.myAds}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">E'lonlarni boshqarish & VIP</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              {onOpenAdmin && (
                <button type="button" onClick={() => { setProfileModalOpen(false); onOpenAdmin(); }} className="group flex w-full items-center justify-between rounded-2xl p-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300"><ShieldCheck size={18} /></div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5"><span className="block text-sm font-bold">{t.adminPanel}</span><span className="rounded-md bg-indigo-600 px-1.5 py-0.2 text-[9px] font-bold text-white">PRO</span></div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Moderatsiya & Tizim tahlili</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              )}

              <button type="button" onClick={() => { setProfileModalOpen(false); onMessagesClick(); }} className="group flex w-full items-center justify-between rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400"><MessageSquare size={18} /></div><div className="text-left"><span className="block text-sm font-bold">{navLabels.messages}</span><span className="text-[11px] text-slate-500 dark:text-slate-400">Xaridorlar bilan yozishmalar</span></div></div>
                <div className="flex items-center gap-2">{unreadCount > 0 && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">{unreadCount}</span>}<ChevronRight size={16} className="text-slate-400" /></div>
              </button>

              <button type="button" onClick={() => { setProfileModalOpen(false); onFavoritesClick(); }} className="group flex w-full items-center justify-between rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/70"><Heart size={18} className="fill-rose-500" /></div><div className="text-left"><span className="block text-sm font-bold">{navLabels.favorites}</span><span className="text-[11px] text-slate-500 dark:text-slate-400">Saqlangan qiziqarli e'lonlar</span></div></div>
                <div className="flex items-center gap-2">{favoritesCount > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{favoritesCount}</span>}<ChevronRight size={16} className="text-slate-400" /></div>
              </button>
            </div>

            {isRegistered && (
              <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  <LogOut size={15} /> <span>{navLabels.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <nav
        id="bottom-navigation-dock"
        aria-label="Pastki asosiy menyu"
        style={{ display: isKeyboardOpen ? 'none' : undefined }}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-2 sm:px-6">
          <button id="bottom-nav-home-btn" type="button" onClick={onHomeClick} className="flex flex-1 flex-col items-center justify-center py-1 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
            <Home size={20} /><span className="mt-1 text-[10px] font-bold">{navLabels.home}</span>
          </button>
          <button id="bottom-nav-messages-btn" type="button" onClick={onMessagesClick} className="relative flex flex-1 flex-col items-center justify-center py-1 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
            <div className="relative"><MessageSquare size={20} />{unreadCount > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-black text-white">{unreadCount}</span>}</div>
            <span className="mt-1 text-[10px] font-bold">{navLabels.messages}</span>
          </button>
          <div className="flex flex-1 items-center justify-center">
            <button id="bottom-nav-post-ad-btn" type="button" onClick={onPostAdClick} className="group relative -top-3 flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/35 dark:border-slate-900"><Plus size={24} strokeWidth={3} /></div>
              <span className="mt-0.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400">{navLabels.postAd}</span>
            </button>
          </div>
          <button id="bottom-nav-favorites-btn" type="button" onClick={onFavoritesClick} className="relative flex flex-1 flex-col items-center justify-center py-1 text-slate-600 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400">
            <div className="relative"><Heart size={20} className={favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />{favoritesCount > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{favoritesCount}</span>}</div>
            <span className="mt-1 text-[10px] font-bold">{navLabels.favorites}</span>
          </button>
          <button id="bottom-nav-profile-btn" type="button" onClick={() => setProfileModalOpen(true)} className="flex flex-1 flex-col items-center justify-center py-1 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-[10px] font-black text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">{initials}</div>
            <span className="mt-1 text-[10px] font-bold">{navLabels.profile}</span>
          </button>
        </div>
      </nav>
    </>
  );
});
