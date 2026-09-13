import React, { useRef } from 'react';
import { History, ChevronLeft, ChevronRight, Trash2, Heart } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { getTranslation } from '../data/translations';

interface RecentlyViewedProps {
  listings: Listing[];
  currency: Currency;
  lang: Language;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onClearHistory: () => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  listings,
  currency,
  lang,
  favorites,
  onToggleFavorite,
  onSelectListing,
  onClearHistory
}) => {
  const t = getTranslation(lang);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (listings.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) return;

    // Move by roughly one viewport instead of a fixed distance.
    // This reduces repeated animations and feels much smoother on phones.
    const scrollAmount = Math.max(220, Math.min(element.clientWidth * 0.82, 520));
    element.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section
      id="recently-viewed-section"
      className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs w-full max-w-full overflow-hidden transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-2xs">
            <History size={15} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t.recentlyViewed}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {listings.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            id="clear-recently-viewed-btn"
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer mr-1"
            title={t.clearHistory}
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline font-medium">{t.clearHistory}</span>
          </button>

          <button
            id="recently-viewed-prev-btn"
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer active:scale-95"
            title="Oldingisi"
            aria-label="Oldingisi"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            id="recently-viewed-next-btn"
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer active:scale-95"
            title="Keyingisi"
            aria-label="Keyingisi"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="recently-viewed-scroll flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none w-full max-w-full overscroll-x-contain touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((item) => (
          <div
            key={item.id}
            className="relative flex w-[220px] sm:w-[250px] shrink-0 items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
          >
            <button
              type="button"
              onClick={() => onSelectListing(item)}
              className="flex min-w-0 flex-1 items-center gap-2 p-2 pr-9 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-500"
              aria-label={item.title}
            >
              <img src={item.images[0]} alt="" loading="lazy" decoding="async" className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-md object-cover bg-slate-200 dark:bg-slate-700" />
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-4 text-slate-800 dark:text-slate-100 line-clamp-2">{item.title}</span>
                <span className="block mt-1 text-xs font-bold text-slate-900 dark:text-white break-words">{formatPrice(item.price, item.currency, currency)}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-label={lang === 'ru' ? 'Избранное' : lang === 'oz' ? 'Сараланган' : 'Saralangan'}
              aria-pressed={favorites.includes(item.id)}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <Heart size={16} className={favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
