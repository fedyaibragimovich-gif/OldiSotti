import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { ListingCard } from './ListingCard';
import { getTranslation } from '../data/translations';

interface VipListingsProps {
  listings: Listing[];
  currency: Currency;
  lang: Language;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  blockedSellerIds?: string[];
}

export const VipListings: React.FC<VipListingsProps> = ({
  listings,
  currency,
  lang,
  favorites,
  onToggleFavorite,
  onSelectListing,
  blockedSellerIds
}) => {
  const t = getTranslation(lang);
  const scrollRef = useRef<HTMLDivElement>(null);

  const vipAds = React.useMemo(() => {
    return listings.filter(l =>
      (l.isVip || l.isTop) &&
      l.status === 'active' &&
      (!blockedSellerIds || (
        !blockedSellerIds.includes(l.seller.id) &&
        !blockedSellerIds.includes(l.userId || '')
      ))
    );
  }, [listings, blockedSellerIds]);

  const comingSoon = lang === 'ru'
    ? 'VIP-объявления — скоро'
    : lang === 'oz'
      ? 'VIP эълонлар — тез орада'
      : 'VIP e’lonlar — tez orada';
  const comingSoonDescription = lang === 'ru'
    ? 'Раздел VIP-объявлений готовится к запуску. Пока вы можете бесплатно просматривать и размещать обычные объявления.'
    : lang === 'oz'
      ? 'VIP эълонлар бўлими ишга туширишга тайёрланмоқда. Ҳозирча оддий эълонларни кўриш ва жойлаштириш мумкин.'
      : 'VIP e’lonlar bo‘limi ishga tushirishga tayyorlanmoqda. Hozircha oddiy e’lonlarni ko‘rish va joylashtirish mumkin.';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section aria-label={vipAds.length === 0 ? comingSoon : t.vipAds} className="mb-8 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-indigo-50/50 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-indigo-950/20 rounded-2xl p-4 sm:p-6 border border-amber-200/70 dark:border-amber-900/40 shadow-xs w-full max-w-full overflow-hidden transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
            <Sparkles size={17} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {vipAds.length === 0 ? comingSoon : t.vipAds}
            </h3>
            {vipAds.length > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ru' ? 'Выделенные объявления' : lang === 'oz' ? 'Ажратиб кўрсатилган эълонлар' : 'Ajratib ko‘rsatilgan e’lonlar'}</p>}
          </div>
        </div>
        {vipAds.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => scroll('left')} className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer" aria-label={lang === 'ru' ? 'Предыдущие VIP-объявления' : 'Oldingi VIP e’lonlar'}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => scroll('right')} className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer" aria-label={lang === 'ru' ? 'Следующие VIP-объявления' : 'Keyingi VIP e’lonlar'}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      {vipAds.length === 0 ? (
        <p role="status" className="text-sm text-slate-700 dark:text-slate-200">{comingSoonDescription}</p>
      ) : (
        <div ref={scrollRef} className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none w-full max-w-full touch-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {vipAds.map(item => (
            <div key={item.id} className="w-[260px] sm:w-[280px] shrink-0">
              <ListingCard listing={item} currency={currency} lang={lang} isFavorite={favorites.includes(item.id)} onToggleFavorite={onToggleFavorite} onSelectListing={onSelectListing} viewMode="grid" inCarousel={true} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
