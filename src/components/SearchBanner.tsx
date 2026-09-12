import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Check, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { regions } from '../data/locations';

interface SearchBannerProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  selectedDistrict?: string;
  onLocationChange: (regionId: string, districtId?: string) => void;
  onSearchSubmit: () => void;
}

export const SearchBanner: React.FC<SearchBannerProps> = ({
  lang,
  searchQuery,
  onSearchChange,
  selectedRegion,
  onLocationChange,
  onSearchSubmit
}) => {
  const t = getTranslation(lang);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Complete list of popular brand and product suggestions
  const popularTags = [
    { label: 'Apple', query: 'Apple', icon: '🍎', cat: 'Brend' },
    { label: 'Samsung', query: 'Samsung', icon: '📱', cat: 'Brend' },
    { label: 'Chevrolet', query: 'Chevrolet', icon: '🚗', cat: 'Brend' },
    { label: 'BYD', query: 'BYD', icon: '⚡', cat: 'Brend' },
    { label: 'Xiaomi', query: 'Xiaomi', icon: '📲', cat: 'Brend' },
    { label: 'Artel', query: 'Artel', icon: '❄️', cat: 'Brend' },
    { label: 'Sony', query: 'Sony', icon: '🎮', cat: 'Brend' },
    { label: 'Nike', query: 'Nike', icon: '👟', cat: 'Brend' },
    { label: 'Bosch', query: 'Bosch', icon: '🔧', cat: 'Brend' },
    { label: 'Dyson', query: 'Dyson', icon: '💨', cat: 'Brend' },
    { label: 'Cobalt', query: 'Cobalt', icon: '🚗', cat: 'Transport' },
    { label: 'Tracker', query: 'Tracker', icon: '🚙', cat: 'Transport' },
    { label: 'iPhone 15 Pro', query: 'iPhone 15', icon: '📱', cat: 'Elektronika' },
    { label: 'Kvartira arenda', query: 'kvartira arenda', icon: '🏢', cat: 'Ko\'chmas mulk' },
    { label: 'PlayStation 5', query: 'PlayStation 5', icon: '🎮', cat: 'Elektronika' },
    { label: 'Yotoqxona mebel', query: 'mebel', icon: '🛋️', cat: 'Uy va bog\'' }
  ];

  // Close dropdowns on click/touch outside or page scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSuggestionsOpen(false);
      }
      if (locationContainerRef.current && !locationContainerRef.current.contains(target)) {
        setLocationDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setIsSuggestionsOpen(false);
      setLocationDropdownOpen(false);
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

  // Filter suggestions based on query
  const filteredSuggestions = searchQuery.trim()
    ? popularTags.filter(tag =>
        tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularTags;

  // Helper to format selected location label
  const getLocationLabel = () => {
    if (!selectedRegion) return t.allUzbekistan;
    const reg = regions.find(r => r.id === selectedRegion);
    if (!reg) return t.allUzbekistan;
    return reg.name[lang] || reg.name.uz || reg.name.ru;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="relative z-20 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950 py-8 sm:py-10 border-b border-slate-200/80 dark:border-slate-800 w-full max-w-full transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 w-full">
        {/* Hero title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            O'zbekistonda qulay xarid va tezkor sotuvlar
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Avtomobillar, ko'chmas mulk, elektronika va minglab saralangan e'lonlar bir joyda
          </p>
        </div>

        {/* Search & Location Container */}
        <div className="flex flex-col md:flex-row items-stretch gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-indigo-900/5 dark:shadow-slate-950/40 border border-slate-200/90 dark:border-slate-800 max-w-4xl mx-auto transition-colors duration-200 relative">
          {/* Mobile backdrop when suggestions are open */}
          {isSuggestionsOpen && (
            <div
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] md:hidden cursor-pointer"
              onClick={() => setIsSuggestionsOpen(false)}
            />
          )}

          {/* Main search input with Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 flex items-center min-w-0 z-50">
            <Search className="absolute left-3.5 text-slate-400 pointer-events-none" size={20} />
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSuggestionsOpen(false);
                } else if (e.key === 'Enter') {
                  setIsSuggestionsOpen(false);
                  handleKeyDown(e);
                }
              }}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              className="w-full pl-11 pr-9 py-3 text-sm sm:text-base font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-transparent rounded-xl focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setIsSuggestionsOpen(true);
                }}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}

            {/* Smart Search Suggestions Dropdown */}
            {isSuggestionsOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 sm:max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-indigo-600 dark:text-indigo-400" />
                    {searchQuery.trim() ? 'Mos takliflar' : 'Ommabop qidiruvlar'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSuggestionsOpen(false)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs normal-case cursor-pointer transition-colors"
                  >
                    <X size={13} />
                    <span>Yopish</span>
                  </button>
                </div>

                {filteredSuggestions.length > 0 ? (
                  <div className="space-y-1">
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          onSearchChange(item.query);
                          setIsSuggestionsOpen(false);
                          setTimeout(() => {
                            onSearchSubmit();
                          }, 50);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors">
                            {item.cat}
                          </span>
                          <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    Mos taklif topilmadi. Qidirish uchun Enter tugmasini bosing.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 my-1"></div>

          {/* Location picker trigger */}
          <div ref={locationContainerRef} className="relative md:w-72 z-40">
            {locationDropdownOpen && (
              <div
                className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] md:hidden cursor-pointer"
                onClick={() => setLocationDropdownOpen(false)}
              />
            )}
            <button
              id="location-picker-btn"
              type="button"
              onClick={() => {
                setTempRegion(selectedRegion);
                setLocationDropdownOpen(!locationDropdownOpen);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-3 text-sm text-left font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 md:bg-transparent md:dark:bg-transparent rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative z-40"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate text-slate-800 dark:text-slate-100 font-semibold">{getLocationLabel()}</span>
              </div>
              <ChevronDown size={16} className="text-slate-400 shrink-0" />
            </button>

            {/* Location selector dropdown modal */}
            {locationDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-full max-w-[calc(100vw-2rem)] md:w-96 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    {lang === 'oz' ? 'Ҳудудни танланг' : lang === 'ru' ? 'Выберите регион' : 'Hududni tanlang'}
                  </h4>
                  <button
                    onClick={() => setLocationDropdownOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* "Butun O'zbekiston" Option */}
                <button
                  onClick={() => {
                    onLocationChange('', '');
                    setLocationDropdownOpen(false);
                  }}
                  className={`mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    !selectedRegion ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" />
                    {t.allUzbekistan}
                  </span>
                  {!selectedRegion && <Check size={16} className="text-indigo-700 dark:text-indigo-400" />}
                </button>

                {/* Regions List */}
                <div className="mt-2 max-h-64 overflow-y-auto space-y-1 pr-1">
                  {regions.map((reg) => {
                    const isRegSelected = selectedRegion === reg.id;
                    const regDisplayName = reg.name[lang] || reg.name.uz || reg.name.ru;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => {
                          onLocationChange(reg.id, '');
                          setLocationDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                          isRegSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{regDisplayName}</span>
                        {isRegSelected && (
                          <Check size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Action Button */}
          <button
            id="search-submit-btn"
            type="button"
            onClick={onSearchSubmit}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-7 py-3 text-sm sm:text-base font-bold text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Search size={18} className="text-white" />
            <span>{t.searchBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
