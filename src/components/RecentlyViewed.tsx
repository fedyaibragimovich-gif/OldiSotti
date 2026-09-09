import React, { useRef } from 'react';
import { History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { ListingCard } from './ListingCard';
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
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="recently-viewed-section"
      className="mt-10 sm:mt-12 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs w-full max-w-full overflow-hidden transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-2xs">
            <History size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {t.recentlyViewed}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {listings.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.recentlyViewedSubtitle}
            </p>
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
        className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none w-full max-w-full overscroll-x-contain touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {listings.map((item) => (
          <div
            key={item.id}
            className="min-w-[220px] sm:min-w-[260px] max-w-[260px] sm:max-w-[280px] shrink-0"
          >
            <ListingCard
              listing={item}
              currency={currency}
              lang={lang}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectListing={onSelectListing}
              viewMode="grid"
              inCarousel={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
