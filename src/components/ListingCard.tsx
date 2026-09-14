import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Truck, Share2, Check } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice, formatPriceSecondary, EXCHANGE_RATE_NOTE, formatDisplayDate } from '../utils/formatters';
import { regions } from '../data/locations';
import { getTranslation } from '../data/translations';

interface ListingCardProps {
  listing: Listing;
  currency: Currency;
  lang: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  viewMode?: 'grid' | 'list';
  inCarousel?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = React.memo(({ listing, currency, lang, isFavorite, onToggleFavorite, onSelectListing, viewMode = 'grid', inCarousel = false }) => {
  const t = getTranslation(lang);
  const [isCopied, setIsCopied] = useState(false);
  const reg = regions.find(r => r.id === listing.location.region);
  const regionName = reg ? (reg.name[lang] || reg.name.uz || reg.name.ru) : listing.location.region;
  const displayLocation = regionName;

  // Paid listings should stand out, but remain consistent with the site's clean design.
  const paidFrame = listing.isVip
    ? 'border-[3px] border-amber-400 dark:border-amber-500 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-700/40 shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_8px_28px_rgba(245,158,11,0.16)] bg-gradient-to-b from-amber-50/80 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900'
    : listing.isTop
      ? 'border-[3px] border-indigo-400 dark:border-indigo-500 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-700/40 shadow-[0_0_0_1px_rgba(99,102,241,0.10),0_8px_28px_rgba(99,102,241,0.14)] bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/25 dark:via-slate-900 dark:to-slate-900'
      : 'border border-slate-200/80 dark:border-slate-800';

  const handleFavoriteClick = (e: React.MouseEvent) => { e.stopPropagation(); onToggleFavorite(listing.id); };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('listing', listing.id);
    const shareUrl = url.toString();
    const shareData = { title: listing.title, text: `${listing.title} - ${formatPrice(listing.price, listing.currency, currency)} | OldiSotdi`, url: shareUrl };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { if (navigator.canShare && !navigator.canShare(shareData)) throw new Error('Cannot share'); await navigator.share(shareData); return; }
      catch (err) { if ((err as Error)?.name === 'AbortError') return; }
    }
    try { if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } } catch { /* ignore */ }
  };


  if (viewMode === 'list') {
    return (
      <div onClick={() => onSelectListing(listing)} className={`${inCarousel ? '' : 'listing-card-contain'} group relative flex flex-col sm:flex-row ${paidFrame} rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-200 cursor-pointer`}>
        <div className="relative sm:w-64 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img src={listing.images[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {listing.isVip && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">VIP</span>}
            {listing.isTop && !listing.isVip && <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">TOP</span>}
          </div>
          {listing.images.length > 1 && <span className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">{listing.images.length} rasm</span>}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2 flex-1 break-words">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={handleShareClick} className={`p-2 rounded-full transition-colors cursor-pointer ${isCopied ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600'}`} title={isCopied ? t.linkCopied : t.share} aria-label={t.share}>
                  {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                </button>
                <button type="button" onClick={handleFavoriteClick} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Tanlanganlarga qo‘shish">
                  <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(listing.price, listing.currency, currency)}</span>
              <span title={EXCHANGE_RATE_NOTE} className="text-xs text-slate-400">{(currency === listing.currency ? formatPriceSecondary(listing.price, listing.currency) : '≈ ' + formatPrice(listing.price, listing.currency))}</span>
              {listing.isNegotiable && <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">Kelishiladi</span>}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{listing.description}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 truncate max-w-xs text-slate-500"><MapPin size={13} /><span className="truncate">{displayLocation}</span></span>
            <span className="shrink-0">{formatDisplayDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onSelectListing(listing)} className={`${inCarousel ? '' : 'listing-card-contain'} group relative flex flex-col ${paidFrame} rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-200 cursor-pointer h-full`}>
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img src={listing.images[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
        
        {/* Status badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {listing.isVip && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">VIP</span>}
          {listing.isTop && !listing.isVip && <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">TOP</span>}
          {listing.condition === 'new' && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">Yangi</span>}
        </div>

        {/* Action buttons on image (Heart + Share) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleShareClick}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all cursor-pointer border ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-white/60 dark:border-slate-700/60 hover:scale-105 active:scale-95'
            }`}
            title={isCopied ? t.linkCopied : t.share}
            aria-label={t.share}
          >
            {isCopied ? <Check size={14} /> : <Share2 size={14} />}
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-400 hover:text-rose-500 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-slate-700/60"
            title="Tanlanganlarga qo‘shish"
            aria-label="Tanlanganlarga qo‘shish"
          >
            <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
        </div>

        {listing.isDeliveryAvailable && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Truck size={11} className="text-indigo-600" />
            <span>Sotuvchi yetkazadi</span>
          </div>
        )}
        {listing.images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
            {listing.images.length} rasm
          </span>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between">
        <div>
          {/* Title now has full width with clear line height and proper wrapping */}
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 line-clamp-2 leading-snug transition-colors break-words">
            {listing.title}
          </h3>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice(listing.price, listing.currency, currency)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400">
                {(currency === listing.currency ? formatPriceSecondary(listing.price, listing.currency) : '≈ ' + formatPrice(listing.price, listing.currency))}
              </span>
              {listing.isNegotiable && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-1.5 py-0.5 rounded">
                  Kelishiladi
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 gap-1">
          <div className="flex items-center gap-1 truncate text-slate-500 dark:text-slate-400 max-w-[65%]">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
          <span className="shrink-0 text-slate-400">{formatDisplayDate(listing.createdAt)}</span>
        </div>
      </div>
    </div>
  );
});
