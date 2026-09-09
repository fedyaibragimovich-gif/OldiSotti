import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Globe,
  ChevronDown,
  ArrowLeftRight,
  Sun,
  Moon,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { categories } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { subscribeToAuth, isAdminUser } from '../lib/auth';

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
  selectedCategoryId = '',
  onSelectCategory,
  onOpenAdmin,
  isDbConnected = false
}) => {
  const t = getTranslation(lang);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const quickBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToAuth((user) => setIsAdmin(isAdminUser(user)));
  }, []);

  // Auto-scroll active category into view inside quick bar
  useEffect(() => {
    if (selectedCategoryId && quickBarRef.current) {
      const activeBtn = quickBarRef.current.querySelector<HTMLElement>(`[data-category-id="${selectedCategoryId}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategoryId]);

  // Close language dropdown on outside click/touch or page scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    const handleScroll = () => {
      setLangDropdownOpen(false);
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

  const allCategoryLabel = {
    uz: 'Barchasi',
    ru: 'Все',
    oz: 'Барчаси'
  }[lang] || 'Barchasi';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs w-full max-w-full transition-colors duration-200 transform-gpu">
      {/* Main navigation header with logo, currency, language, mode, and favorites */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 sm:px-4 py-2 sm:py-3 w-full gap-1.5 sm:gap-2">
        {/* Left: Original Oldisotti Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <button
            id="brand-home-logo"
            type="button"
            onClick={onResetToHome}
            className="group flex items-center gap-1 sm:gap-2.5 focus:outline-none cursor-pointer"
            title="Oldisotti O'zbekiston"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-all shrink-0">
              <ArrowLeftRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-black text-lg sm:text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white transition-colors">
                oldi<span className="text-indigo-600 dark:text-indigo-400">sotti</span>
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
            <button id="currency-usd-btn" type="button" onClick={() => onCurrencyChange('USD')} className={`rounded-lg px-1.5 sm:px-2.5 py-1 font-bold transition-all cursor-pointer ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>USD ($)</button>
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

          <div id="cloud-db-status-badge" className={`hidden md:flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs font-semibold border transition-all select-none ${isDbConnected ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/70' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700'}`} title={isDbConnected ? "Firestore bulutli ma'lumotlar bazasi ulangan va real-vaqt rejimida sinxronlanmoqda" : "Ma'lumotlar bazasi ulanmoqda..."}>
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="hidden lg:inline">{isDbConnected ? 'Firestore Jonli' : 'Baza'}</span>
          </div>

          {onOpenAdmin && isAdmin && (
            <button id="header-admin-btn" type="button" onClick={onOpenAdmin} className="flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/80 dark:border-indigo-800/80 transition-all cursor-pointer shadow-2xs" title={t.adminPanel} aria-label={t.adminPanel}>
              <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden sm:inline font-bold">{t.adminPanel}</span>
            </button>
          )}

          <button id="header-favorites-btn" type="button" onClick={onOpenFavorites} className="relative hidden md:flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700" title={t.favorites}>
            <div className="relative">
              <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
              {favoritesCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">{favoritesCount}</span>}
            </div>
            <span className="hidden md:inline font-bold">{t.favorites}</span>
          </button>
        </div>
      </div>

      <div id="header-quick-categories-bar" ref={quickBarRef} className="md:hidden border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 w-full transition-colors" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }} aria-label="Quick Categories">
        <button id="header-quick-cat-all" type="button" onClick={() => { onSelectCategory?.(''); document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' }); }} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${!selectedCategoryId ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'}`}>
          <Layers size={13} className={!selectedCategoryId ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
          <span>{allCategoryLabel}</span>
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const catName = cat.name[lang] || cat.name.uz;
          return <button key={cat.id} id={`header-quick-cat-${cat.slug}`} data-category-id={cat.id} type="button" onClick={() => { if (isSelected) onSelectCategory?.(''); else { onSelectCategory?.(cat.id); document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' }); } }} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'}`}>
            <CategoryIcon name={cat.iconName} size={13} className={`shrink-0 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span>{catName}</span>
          </button>;
        })}
      </div>
    </header>
  );
});
