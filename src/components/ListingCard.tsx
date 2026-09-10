import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Truck, Share2, Check, AlertTriangle, Ban } from 'lucide-react';
import { Listing, Currency, Language, ModerationReport } from '../types';
import { formatPrice, formatPriceSecondary } from '../utils/formatters';
import { regions } from '../data/locations';
import { getTranslation } from '../data/translations';
import { auth, blockSellerInDb, isSellerBlockedInDb, saveReportToDb } from '../lib/firebase';

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [reporting, setReporting] = useState(false);

  const sellerUid = listing.userId || (listing.seller.id !== 'user-self' ? listing.seller.id : '');

  useEffect(() => {
    let cancelled = false;
    const loadBlockState = async () => {
      try {
        const local = JSON.parse(localStorage.getItem('olx_blocked_sellers') || '[]');
        if (Array.isArray(local) && local.includes(listing.seller.id)) {
          if (!cancelled) setIsBlocked(true);
          return;
        }
        if (sellerUid && auth.currentUser) {
          const blocked = await isSellerBlockedInDb(sellerUid);
          if (!cancelled) setIsBlocked(blocked);
        }
      } catch { if (!cancelled) setIsBlocked(false); }
    };
    loadBlockState();
    return () => { cancelled = true; };
  }, [listing.seller.id, sellerUid]);

  const reg = regions.find(r => r.id === listing.location.region);
  const regionName = reg ? (reg.name[lang] || reg.name.uz || reg.name.ru) : listing.location.region;
  const dist = reg?.districts.find(d => d.id === listing.location.district);
  const districtName = dist ? (dist.name[lang] || dist.name.uz || dist.name.ru) : '';
  const displayLocation = districtName ? `${regionName}, ${districtName}` : regionName;

  // Paid listings should stand out, but remain consistent with the site's clean design.
  const paidFrame = listing.isVip
    ? 'border-[3px] border-amber-400 dark:border-amber-500 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-700/40 shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_8px_28px_rgba(245,158,11,0.16)] bg-gradient-to-b from-amber-50/80 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900'
    : listing.isTop
      ? 'border-[3px] border-indigo-400 dark:border-indigo-500 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-700/40 shadow-[0_0_0_1px_rgba(99,102,241,0.10),0_8px_28px_rgba(99,102,241,0.14)] bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/25 dark:via-slate-900 dark:to-slate-900'
      : 'border border-slate-200/80 dark:border-slate-800';

  const handleFavoriteClick = (e: React.MouseEvent) => { e.stopPropagation(); onToggleFavorite(listing.id); };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
    const shareUrl = `${baseUrl}#listing-${listing.id}`;
    const shareData = { title: listing.title, text: `${listing.title} - ${formatPrice(listing.price, listing.currency, currency)} | Oldisotti`, url: shareUrl };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { if (navigator.canShare && !navigator.canShare(shareData)) throw new Error('Cannot share'); await navigator.share(shareData); return; }
      catch (err) { if ((err as Error)?.name === 'AbortError') return; }
    }
    try { if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } } catch { /* ignore */ }
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser || reporting) { if (!auth.currentUser) window.alert('Shikoyat yuborish uchun avval tizimga kiring.'); return; }
    const raw = window.prompt('Sababni kiriting: spam, price, prohibited, fraud yoki other', 'fraud');
    if (!raw) return;
    const normalized = raw.trim().toLowerCase();
    const reason: ModerationReport['reason'] = ['spam', 'price', 'prohibited', 'fraud', 'other'].includes(normalized) ? normalized as ModerationReport['reason'] : 'other';
    const comment = window.prompt('Qo‘shimcha izoh (ixtiyoriy):', '') || undefined;
    const reportKey = `report-${auth.currentUser.uid}-${listing.id}`;
    if (localStorage.getItem(`oldisotti_reported_${listing.id}`)) { window.alert('Bu e’lon bo‘yicha siz allaqachon shikoyat yuborgansiz.'); return; }
    setReporting(true);
    try {
      await saveReportToDb({ id: reportKey, listingId: listing.id, listingTitle: listing.title, reason, comment, reporterId: auth.currentUser.uid, createdAt: new Date().toISOString(), status: 'pending' });
      localStorage.setItem(`oldisotti_reported_${listing.id}`, '1');
      window.alert('Shikoyatingiz yuborildi. Rahmat.');
    } catch (error) { console.warn('Report failed:', error); window.alert('Shikoyat yuborishda xatolik yuz berdi.'); }
    finally { setReporting(false); }
  };

  const handleBlockSeller = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) { window.alert('Sotuvchini bloklash uchun avval tizimga kiring.'); return; }
    if (!sellerUid || sellerUid === auth.currentUser.uid) return;
    const ok = window.confirm(`${listing.seller.name} sotuvchisini bloklaysizmi? Uning e’lonlari boshqa qurilmalaringizda ham yashiriladi.`);
    if (!ok) return;
    try {
      await blockSellerInDb(sellerUid);
      const current = JSON.parse(localStorage.getItem('olx_blocked_sellers') || '[]');
      const next = Array.isArray(current) ? Array.from(new Set([...current, listing.seller.id, sellerUid])) : [listing.seller.id, sellerUid];
      localStorage.setItem('olx_blocked_sellers', JSON.stringify(next));
      setIsBlocked(true);
    } catch (error) { console.warn('Block failed:', error); window.alert('Sotuvchini bloklashda xatolik yuz berdi.'); }
  };

  if (isBlocked) return null;

  const actionButtons = <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
    <button type="button" onClick={handleReport} className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Shikoyat qilish" aria-label="Shikoyat qilish"><AlertTriangle size={15} /></button>
    <button type="button" onClick={handleBlockSeller} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" title="Sotuvchini bloklash" aria-label="Sotuvchini bloklash"><Ban size={15} /></button>
    <div className="relative"><button type="button" onClick={handleShareClick} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isCopied ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600'}`} title={isCopied ? t.linkCopied : t.share} aria-label={t.share}>{isCopied ? <Check size={16} /> : <Share2 size={16} />}</button>{isCopied && <span className="absolute -bottom-6 right-0 whitespace-nowrap rounded-md bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 shadow-md pointer-events-none z-20">{t.linkCopied}</span>}</div>
    <button type="button" onClick={handleFavoriteClick} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Tanlanganlarga qo‘shish"><Heart size={17} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} /></button>
  </div>;

  if (viewMode === 'list') return <div onClick={() => onSelectListing(listing)} className={`${inCarousel ? '' : 'listing-card-contain'} group relative flex flex-col sm:flex-row ${paidFrame} rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-200 cursor-pointer`}>
    <div className="relative sm:w-64 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden"><img src={listing.images[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
      {listing.isVip && <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">VIP</span>}{listing.isTop && !listing.isVip && <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">TOP</span>}{listing.images.length > 1 && <span className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">{listing.images.length} rasm</span>}
    </div>
    <div className="flex-1 p-4 flex flex-col justify-between"><div><div className="flex items-start justify-between gap-3"><h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">{listing.title}</h3>{actionButtons}</div><div className="mt-2 flex items-baseline gap-2"><span className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(listing.price, listing.currency, currency)}</span><span className="text-xs text-slate-400">{formatPriceSecondary(listing.price, listing.currency)}</span>{listing.isNegotiable && <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">Kelishiladi</span>}</div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{listing.description}</p></div><div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400"><span className="flex items-center gap-1.5 truncate max-w-xs text-slate-500"><MapPin size={13} /><span className="truncate">{displayLocation}</span></span><span className="shrink-0">{listing.createdAt}</span></div></div>
  </div>;

  return <div onClick={() => onSelectListing(listing)} className={`${inCarousel ? '' : 'listing-card-contain'} group relative flex flex-col ${paidFrame} rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-200 cursor-pointer h-full`}>
    <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><img src={listing.images[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">{listing.isVip && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">VIP</span>}{listing.isTop && !listing.isVip && <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">TOP</span>}{listing.condition === 'new' && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Yangi</span>}</div>
      {listing.isDeliveryAvailable && <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Truck size={11} className="text-indigo-600" /><span>Sotuvchi yetkazadi</span></div>}
      {listing.images.length > 1 && <span className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">{listing.images.length} rasm</span>}
    </div>
    <div className="flex-1 p-3.5 flex flex-col justify-between"><div><div className="flex items-start justify-between gap-2"><h3 className="min-w-0 flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 line-clamp-2 leading-snug">{listing.title}</h3>{actionButtons}</div><div className="mt-2.5"><div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{formatPrice(listing.price, listing.currency, currency)}</div><div className="flex items-center gap-1.5 mt-0.5"><span className="text-[11px] text-slate-400">{formatPriceSecondary(listing.price, listing.currency)}</span>{listing.isNegotiable && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded">Kelishiladi</span>}</div></div></div><div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col text-[11px] text-slate-400 gap-0.5"><div className="flex items-center gap-1 truncate text-slate-500"><MapPin size={11} /><span className="truncate">{displayLocation}</span></div><span>{listing.createdAt}</span></div></div>
  </div>;
});
