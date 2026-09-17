import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Globe,
  ChevronDown,
  ArrowLeftRight,
  Sun,
  Moon,
  ShieldCheck,
  Plus,
  User,
  LogOut,
  Layers,
  Loader2
} from 'lucide-react';
import { Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { subscribeToAuth, isAdminUser, logoutUser } from '../lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onResetToHome: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  unreadCount?: number;
  onOpenChat?: () => void;
  onOpenPostAd?: () => void;
  onOpenMyAds?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  selectedCategoryId?: string;
  onSelectCategory?: (categoryId: string) => void;
  onOpenAdmin?: () => void;
  isDbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  lang,
  onLanguageChange,
  currency,
  onCurrencyChange,
  favoritesCount,
  onOpenFavorites,
  onResetToHome,
  darkMode = false,
  onToggleDarkMode,
  onOpenAdmin,
  onOpenPostAd,
  onOpenMyAds,
  onOpenAuth
}) => {
  const t = getTranslation(lang);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToAuth((user) => {
      setCurrentUser(user);
      setIsAdmin(isAdminUser(user));
    });
  }, []);

  const handleHeaderLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setUserMenuOpen(false);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close dropdowns on outside click/touch or page scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleScroll = () => {
      setLangDropdownOpen(false);
      setUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs w-full max-w-full transition-colors duration-200 transform-gpu">
      {/* Main navigation header with logo, currency, language, mode, and favorites */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 sm:px-4 py-2 sm:py-3 w-full gap-1.5 sm:gap-2">
        {/* Left: Original OldiSotdi Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <button
            id="brand-home-logo"
            type="button"
            onClick={onResetToHome}
            className="group flex items-center gap-1 sm:gap-2.5 focus:outline-none cursor-pointer"
            title="OldiSotdi O'zbekiston"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-all shrink-0">
              <ArrowLeftRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-black text-lg sm:text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white transition-colors">
                oldi<span className="text-indigo-600 dark:text-indigo-400">sotdi</span>
              </span>
              <span className="ml-1 sm:ml-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                uz
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0">
          <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-[10px] sm:text-xs">
            <button id="currency-uzs-btn" type="button" onClick={() => onCurrencyChange('UZS')} className={`rounded-lg px-1.5 sm:px-2.5 py-1 font-bold transition-all cursor-pointer ${currency === 'UZS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>UZS</button>
            <button title="Taxminiy hisob: 1 USD = 12 750 so‘m. Bank kursi emas." id="currency-usd-btn" type="button" onClick={() => onCurrencyChange('USD')} className={`rounded-lg px-1.5 sm:px-2.5 py-1 font-bold transition-all cursor-pointer ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>USD ($)</button>
          </div>

          <div ref={langContainerRef} className="relative">
            <button id="lang-selector-btn" type="button" onClick={() => setLangDropdownOpen(!langDropdownOpen)} className="flex items-center space-x-0.5 sm:space-x-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors font-bold text-xs sm:text-sm cursor-pointer">
              <Globe size={12} className="shrink-0 text-slate-500 dark:text-slate-400 sm:w-3.5 sm:h-3.5" />
              <span className="uppercase">{lang === 'oz' ? 'ЎЗ' : lang}</span>
              <ChevronDown size={11} className="shrink-0 text-slate-400" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 py-1.5 shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button type="button" onClick={() => { onLanguageChange('uz'); setLangDropdownOpen(false); }} className={`block w-full px-3 py-1.5 text-left text-xs font-semibold cursor-pointer ${lang === 'uz' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>O'zbekcha (Lotin)</button>
                <button type="button" onClick={() => { onLanguageChange('oz'); setLangDropdownOpen(false); }} className={`block w-full px-3 py-1.5 text-left text-xs font-semibold cursor-pointer ${lang === 'oz' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Ўзбекча (Кирилл)</button>
                <button type="button" onClick={() => { onLanguageChange('ru'); setLangDropdownOpen(false); }} className={`block w-full px-3 py-1.5 text-left text-xs font-semibold cursor-pointer ${lang === 'ru' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Русский (RU)</button>
              </div>
            )}
          </div>

          {onToggleDarkMode && (
            <button id="theme-toggle-main-nav-btn" type="button" onClick={onToggleDarkMode} className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-2xs" title={darkMode ? t.dayMode : t.nightMode} aria-label={t.themeToggle}>
              {darkMode ? <><Sun size={16} className="text-amber-400 shrink-0" /><span className="hidden md:inline text-amber-500 dark:text-amber-400 font-semibold">{t.dayMode}</span></> : <><Moon size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" /><span className="hidden md:inline text-slate-700 dark:text-slate-200 font-semibold">{t.nightMode}</span></>}
            </button>
          )}

          {onOpenAdmin && isAdmin && (
            <button id="header-admin-btn" type="button" onClick={onOpenAdmin} className="flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/80 dark:border-indigo-800/80 transition-all cursor-pointer shadow-2xs" title={t.adminPanel} aria-label={t.adminPanel}>
              <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden sm:inline font-bold">{t.adminPanel}</span>
            </button>
          )}

          <NotificationCenter lang={lang} />

          <button id="header-favorites-btn" type="button" onClick={onOpenFavorites} className="relative hidden md:flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700" title={t.favorites}>
            <div className="relative">
              <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
              {favoritesCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">{favoritesCount}</span>}
            </div>
            <span className="hidden md:inline font-bold">{t.favorites}</span>
          </button>

          {/* User Account Menu / Login (Desktop) */}
          <div ref={userMenuRef} className="relative hidden md:block">
            {currentUser && !currentUser.isAnonymous ? (
              <>
                <button
                  id="header-user-menu-btn"
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors font-bold text-xs sm:text-sm cursor-pointer"
                  title={currentUser.displayName || currentUser.email || currentUser.phoneNumber || t.myProfile}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-black">
                    {(currentUser.displayName || currentUser.email || currentUser.phoneNumber || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate hidden lg:inline text-xs font-semibold">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || currentUser.phoneNumber || t.myProfile}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 py-2 shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold truncate">{currentUser.displayName || (currentUser.phoneNumber ? 'Foydalanuvchi' : 'Foydalanuvchi')}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email || currentUser.phoneNumber}</p>
                    </div>

                    {onOpenMyAds && (
                      <button
                        type="button"
                        id="header-menu-my-ads-btn"
                        onClick={() => { setUserMenuOpen(false); onOpenMyAds(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Layers size={15} className="text-indigo-600 dark:text-indigo-400" />
                        <span>{t.myAds}</span>
                      </button>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        id="header-menu-logout-btn"
                        disabled={isLoggingOut}
                        onClick={handleHeaderLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                        <span>{isLoggingOut ? (lang === 'ru' ? 'Выход...' : lang === 'oz' ? 'Чиқилмоқда...' : 'Chiqilmoqda...') : t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : onOpenAuth ? (
              <button
                id="header-login-btn"
                type="button"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors font-bold text-xs sm:text-sm cursor-pointer"
              >
                <User size={15} />
                <span>{lang === 'ru' ? 'Войти' : lang === 'oz' ? 'Кириш' : 'Kirish'}</span>
              </button>
            ) : null}
          </div>

          {onOpenPostAd && (
            <button
              id="header-post-ad-btn"
              type="button"
              onClick={onOpenPostAd}
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs hover:shadow-indigo-600/25 cursor-pointer shrink-0"
              title={lang === 'ru' ? 'Подать объявление' : lang === 'oz' ? 'Эълон бериш' : "E'lon berish"}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="font-bold">
                {lang === 'ru' ? 'Подать объявление' : lang === 'oz' ? 'Эълон бериш' : "E'lon berish"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
});
