import { browserStorage } from '../lib/browserStorage';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  AlertTriangle,
  Ban,
  Copy,
  ExternalLink,
  Truck,
  Bell,
  BellRing,
  TrendingDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { Listing, Currency, Language, ModerationReport } from '../types';
import { formatPrice, formatPriceSecondary, maskPhoneNumber } from '../utils/formatters';
import { getTranslation } from '../data/translations';
import { regions } from '../data/locations';
import { categories } from '../data/categories';
import { InfoTabKey } from '../data/infoPagesData';
import { PriceHistoryChart } from './PriceHistoryChart';
import { SimilarListingsSection } from './SimilarListingsSection';
import { LocationMap } from './LocationMap';
import { auth, saveReportToDb, blockSellerInDb } from '../lib/firebase';
import { injectListingMetaTags, resetMetaTags } from '../utils/metaTags';

const REGION_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  'tashkent-city': { latitude: 41.311081, longitude: 69.240562 },
  'tashkent-reg': { latitude: 41.2858, longitude: 69.2038 },
  'samarkand': { latitude: 39.6542, longitude: 66.9597 },
  'bukhara': { latitude: 39.7681, longitude: 64.4556 },
  'andijan': { latitude: 40.7821, longitude: 72.3442 },
  'fergana': { latitude: 40.3842, longitude: 71.7843 },
  'namangan': { latitude: 40.9983, longitude: 71.6726 },
  'kashkadarya': { latitude: 38.8606, longitude: 65.7891 },
  'surkhandarya': { latitude: 37.2242, longitude: 67.2783 },
  'khorezm': { latitude: 41.5562, longitude: 60.6313 },
  'navoiy': { latitude: 40.0844, longitude: 65.3792 },
  'jizzakh': { latitude: 40.1158, longitude: 67.8422 },
  'sirdaryo': { latitude: 40.4939, longitude: 68.7844 },
  'karakalpakstan': { latitude: 42.4619, longitude: 59.6166 }
};

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  currency: Currency;
  lang: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat: (listing: Listing) => void;
  onSelectListing: (listing: Listing) => void;
  allListings: Listing[];
  favorites?: string[];
  onOpenInfoModal?: (tab: InfoTabKey) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  currency,
  lang,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onSelectListing,
  allListings,
  favorites = [],
  onOpenInfoModal
}) => {
  const t = getTranslation(lang);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Lightbox full-size zoom state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Reset photo index, zoom, phone state, and scroll to top when listing changes
  useEffect(() => {
    setActivePhotoIndex(0);
    setIsPhoneRevealed(false);
    setIsLightboxOpen(false);
    setLightboxZoom(1);
    modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [listing?.id]);

  // Reset zoom when photo index changes in lightbox
  useEffect(() => {
    setLightboxZoom(1);
  }, [activePhotoIndex, isLightboxOpen]);

  const handleNextPhoto = () => {
    if (!listing?.images?.length) return;
    setActivePhotoIndex((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevPhoto = () => {
    if (!listing?.images?.length) return;
    setActivePhotoIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  // Touch swipe handling for mobile devices
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Minimum swipe threshold 40px and predominantly horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Swiped left -> show next photo
        handleNextPhoto();
      } else {
        // Swiped right -> show previous photo
        handlePrevPhoto();
      }
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPhoto();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setLightboxZoom(prev => Math.min(Number((prev + 0.5).toFixed(1)), 3));
      } else if (e.key === '-') {
        e.preventDefault();
        setLightboxZoom(prev => Math.max(Number((prev - 0.5).toFixed(1)), 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, listing?.images?.length]);

  // Price Alert state persisted in localStorage
  const [hasPriceAlert, setHasPriceAlert] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('oldisotti_price_alerts');
      if (stored && listing?.id) {
        const alerts = JSON.parse(stored);
        return Boolean(alerts[listing.id]);
      }
    } catch {
      return false;
    }
    return false;
  });

  // Sync alert state when listing changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oldisotti_price_alerts');
      if (stored && listing?.id) {
        const alerts = JSON.parse(stored);
        setHasPriceAlert(Boolean(alerts[listing.id]));
      } else {
        setHasPriceAlert(false);
      }
    } catch {
      setHasPriceAlert(false);
    }
  }, [listing?.id]);

  // Guard after all hooks: if no listing, do not render
  if (!listing) return null;

  const handleTogglePriceAlert = () => {
    try {
      const stored = localStorage.getItem('oldisotti_price_alerts');
      const alerts: Record<string, {
        listingId: string;
        title: string;
        currentPrice: number;
        currency: string;
        subscribedAt: string;
      }> = stored ? JSON.parse(stored) : {};

      const nextState = !hasPriceAlert;

      if (nextState) {
        alerts[listing.id] = {
          listingId: listing.id,
          title: listing.title,
          currentPrice: listing.price,
          currency: listing.currency,
          subscribedAt: new Date().toISOString(),
        };
        setCopiedToast(t.priceAlertSubscribed);
      } else {
        delete alerts[listing.id];
        setCopiedToast(t.priceAlertUnsubscribed);
      }

      localStorage.setItem('oldisotti_price_alerts', JSON.stringify(alerts));
      setHasPriceAlert(nextState);
      setTimeout(() => setCopiedToast(null), 2500);
    } catch (err) {
      console.error('Failed to update price alert in localStorage', err);
    }
  };

  // Category and location info
  const cat = categories.find(c => c.id === listing.categoryId);
  const reg = regions.find(r => r.id === listing.location.region);
  const regionName = reg ? (reg.name[lang] || reg.name.uz || reg.name.ru) : listing.location.region;
  const displayLocation = regionName;

  const copyText = async (text: string, message: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setCopiedToast(message);
    } catch {
      setCopiedToast(lang === 'ru' ? 'Не удалось скопировать. Скопируйте вручную.' : lang === 'oz' ? 'Нусхаланмади. Қўлда нусхаланг.' : 'Nusxalanmadi. Qo‘lda nusxalang.');
    }
    setTimeout(() => setCopiedToast(null), 2500);
  };
  // Dynamically inject OpenGraph and Twitter meta tags when listing modal opens
  useEffect(() => {
    injectListingMetaTags(listing, { currency, lang });
    return () => {
      resetMetaTags();
    };
  }, [listing.id, currency, lang]);

  const handleCopyPhone = () => copyText(listing.seller.phone, t.phoneCopied);
  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/l/${encodeURIComponent(listing.id)}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${listing.title} | OldiSotdi`,
          text: `${listing.title} — ${formatPrice(listing.price, listing.currency, currency)}`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    copyText(shareUrl, t.linkCopied);
  };

  const sellerUid = listing.userId || (listing.seller.id !== 'user-self' ? listing.seller.id : '');

  const handleReport = async () => {
    if (!auth.currentUser) {
      setCopiedToast('Shikoyat yuborish uchun avval tizimga kiring.');
      setTimeout(() => setCopiedToast(null), 3000);
      return;
    }
    const raw = window.prompt('Sababni kiriting: spam, price, prohibited, fraud yoki other', 'fraud');
    if (!raw) return;
    const normalized = raw.trim().toLowerCase();
    const reason: ModerationReport['reason'] = ['spam', 'price', 'prohibited', 'fraud', 'other'].includes(normalized) ? (normalized as ModerationReport['reason']) : 'other';
    const comment = (window.prompt('Qo‘shimcha izoh (ixtiyoriy):', '') || '').slice(0, 2000);
    const reportKey = `report-${auth.currentUser.uid}-${listing.id}`;
    if (browserStorage.getItem(`oldisotti_reported_${auth.currentUser.uid}_${listing.id}`)) {
      setCopiedToast('Bu e’lon bo‘yicha siz allaqachon shikoyat yuborgansiz.');
      setTimeout(() => setCopiedToast(null), 3000);
      return;
    }
    try {
      await saveReportToDb({
        id: reportKey,
        listingId: listing.id,
        listingTitle: listing.title,
        reason,
        comment,
        reporterId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      browserStorage.setItem(`oldisotti_reported_${auth.currentUser.uid}_${listing.id}`, '1');
      setCopiedToast('Shikoyatingiz qabul qilindi. Rahmat!');
      setTimeout(() => setCopiedToast(null), 3000);
    } catch {
      setCopiedToast('Shikoyat yuborishda xatolik yuz berdi.');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  const handleBlockSeller = async () => {
    if (!auth.currentUser) {
      setCopiedToast('Sotuvchini bloklash uchun avval tizimga kiring.');
      setTimeout(() => setCopiedToast(null), 3000);
      return;
    }
    if (!sellerUid || sellerUid === auth.currentUser.uid) {
      setCopiedToast('O‘z profilingizni bloklay olmaysiz.');
      setTimeout(() => setCopiedToast(null), 3000);
      return;
    }
    const ok = window.confirm(`${listing.seller.name} sotuvchisini bloklaysizmi? Uning e’lonlari sizga boshqa ko‘rinmaydi.`);
    if (!ok) return;
    try {
      await blockSellerInDb(sellerUid);
      setCopiedToast('Sotuvchi bloklandi.');
      setTimeout(() => {
        setCopiedToast(null);
        onClose();
      }, 1200);
    } catch {
      setCopiedToast('Sotuvchini bloklashda xatolik yuz berdi.');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        ref={modalContainerRef}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col my-auto max-h-screen sm:max-h-[92vh] overflow-y-auto overflow-x-hidden border border-transparent dark:border-slate-800 transition-colors duration-200"
      >
        {/* Sticky modal top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800">
          {/* Breadcrumbs */}
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate mr-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{cat?.name[lang] || 'Toifa'}</span>
            <ChevronRight size={14} className="mx-1 text-slate-400 shrink-0" />
            <span className="truncate">{listing.title}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="btn-top-price-alert"
              onClick={handleTogglePriceAlert}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                hasPriceAlert
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={hasPriceAlert ? t.priceAlertActive : t.priceAlert}
            >
              {hasPriceAlert ? <BellRing size={18} className="animate-pulse" /> : <Bell size={18} />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title={t.share}
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title={t.favorites}
            >
              <Heart
                size={19}
                className={isFavorite ? 'fill-rose-500 text-rose-500' : ''}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={t.close}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification toast */}
        {copiedToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-bounce">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{copiedToast}</span>
          </div>
        )}

        {/* Modal Body: 2 columns on desktop */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Gallery & Description & Specs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Photo Gallery */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative rounded-2xl bg-slate-950 overflow-hidden aspect-[4/3] flex items-center justify-center shadow-inner group cursor-zoom-in select-none touch-pan-y"
              >
                <img
                  src={listing.images[activePhotoIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 shadow-xl">
                    <ZoomIn size={16} className="text-indigo-400" />
                    <span>{t.fullSize}</span>
                  </div>
                </div>

                {/* Full-size Lightbox Trigger Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/15 shadow-md transition-all hover:scale-105 cursor-pointer z-10"
                  title={t.fullSize}
                >
                  <Maximize2 size={13} className="text-indigo-300" />
                  <span className="hidden sm:inline">{t.zoomImage}</span>
                </button>

                {/* Left/Right nav buttons */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPhoto();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer z-10"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPhoto();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer z-10"
                    >
                      <ChevronRight size={22} />
                    </button>
                    {/* Photo index counter */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs z-10">
                      {activePhotoIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails reel */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-18 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Characteristics / Specifications Table */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    {t.characteristics}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                    {Object.entries(listing.attributes).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  {t.description}
                </h4>
                <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {listing.description}
                </div>
              </div>

              {/* Location & Interactive Mock Map */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  {t.locationOnMap}
                </h4>
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{displayLocation}</span>
                  </div>
                  {listing.location.address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 ml-6">{listing.location.address}</p>
                  )}

                  {typeof listing.location.latitude === 'number' && typeof listing.location.longitude === 'number' ? (
                    <LocationMap
                      value={{ latitude: listing.location.latitude, longitude: listing.location.longitude }}
                      readOnly
                      heightClass="h-48 sm:h-56"
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                      Bu e'lon uchun xaritadagi aniq nuqta ko‘rsatilmagan.
                    </div>
                  )}
                </div>
              </div>

              {/* Listing meta info */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>{t.adId}: {listing.id}</span>
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  <span>{listing.viewsCount} {t.views}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>{listing.createdAt}</span>
                </span>
              </div>
            </div>

            {/* Right Column: Price & Seller Card & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Price Card */}
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(listing.price, listing.currency, currency)}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    listing.isNegotiable ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {listing.isNegotiable ? t.negotiable : t.fixedPrice}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 font-medium">
                  {formatPriceSecondary(listing.price, listing.currency)}
                </p>

                <h1 className="mt-3 text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {listing.title}
                </h1>

                {/* Delivery / Handover status tag */}
                {listing.isDeliveryAvailable ? (
                  <div className="mt-3 flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50 text-indigo-900 text-xs font-medium border border-indigo-200">
                    <Truck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {lang === 'uz' ? "Sotuvchi o'zi yetkazib beradi" : lang === 'ru' ? "Продавец доставляет сам" : "Seller delivers personally"}
                      </span>
                      {listing.deliveryNote && (
                        <p className="text-[11px] text-indigo-700 mt-0.5 font-normal">
                          {listing.deliveryNote}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 ml-1" />
                    <span>
                      {lang === 'uz' ? "Faqat olib ketish (Samovivoz)" : lang === 'ru' ? "Только самовывоз" : "Pickup only"}
                    </span>
                  </div>
                )}

                {/* Price Drop Alert Toggle Card */}
                <div
                  id={`price-alert-card-${listing.id}`}
                  className={`mt-4 rounded-xl p-3 sm:p-3.5 border transition-all duration-200 ${
                    hasPriceAlert
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          hasPriceAlert
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {hasPriceAlert ? (
                          <BellRing size={18} className="animate-bounce" />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold truncate text-slate-900">
                            {t.priceAlert}
                          </span>
                          {hasPriceAlert && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                              {t.priceAlertBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] leading-tight text-slate-500 mt-0.5">
                          {hasPriceAlert ? t.priceAlertActive : t.priceAlertDesc}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hasPriceAlert}
                      onClick={handleTogglePriceAlert}
                      id={`price-alert-toggle-${listing.id}`}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                        hasPriceAlert ? 'bg-amber-500' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={hasPriceAlert ? t.priceAlertActive : t.priceAlertInactive}
                    >
                      <span className="sr-only">{t.priceAlert}</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          hasPriceAlert ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subscribed active info bar */}
                  {hasPriceAlert && (
                    <div className="mt-2.5 pt-2.5 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                      <span className="flex items-center gap-1.5 font-medium">
                        <TrendingDown size={13} className="text-amber-700 shrink-0" />
                        <span>{t.priceAlertCurrentPrice}: <strong className="font-bold">{formatPrice(listing.price, listing.currency, currency)}</strong></span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
                        Faol / Saved
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 30-Day Price Fluctuations Chart */}
              <PriceHistoryChart
                listing={listing}
                currency={currency}
                lang={lang}
              />

              {/* Seller Card */}
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {listing.seller.name}
                      </h4>
                      {listing.seller.isVerified && (
                        <span title={t.verifiedSeller} className="inline-flex shrink-0">
                          <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400">
                      {t.onOlxSince} {listing.seller.registeredSince}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      <span>{listing.seller.responseTime}</span>
                    </p>
                  </div>
                </div>

                {/* Seller Actions */}
                <div className="space-y-2.5 pt-2">
                  {/* Phone reveal button */}
                  {!isPhoneRevealed ? (
                    <button
                      id="reveal-phone-btn"
                      onClick={() => {
                        setIsPhoneRevealed(true);
                        handleCopyPhone();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <Phone size={18} className="text-indigo-400 dark:text-white" />
                      <span>{maskPhoneNumber(listing.seller.phone)}</span>
                      <span className="text-[11px] bg-white/10 text-indigo-300 dark:text-white px-2 py-0.5 rounded-full ml-1 font-normal">
                        {t.showPhone}
                      </span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <a
                        href={`tel:${listing.seller.phone.replace(/\s+/g, '')}`}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-4 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-md"
                      >
                        <Phone size={18} />
                        <span>{listing.seller.phone}</span>
                      </a>
                      <button
                        onClick={handleCopyPhone}
                        className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Nusxalash"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  )}

                  {/* Message seller button */}
                  <button
                    id="write-message-btn"
                    onClick={() => onStartChat(listing)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-3.5 px-4 text-sm font-bold text-white transition-all shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer"
                  >
                    <MessageSquare size={18} />
                    <span>{t.writeMessage}</span>
                  </button>

                  {/* Telegram shortcut if available */}
                  {listing.seller.telegram && (
                    <a
                      href={`https://t.me/${listing.seller.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 py-2.5 px-4 text-xs font-bold hover:bg-sky-500/15 dark:hover:bg-sky-500/30 transition-colors"
                    >
                      <Send size={15} />
                      <span>Telegram: {listing.seller.telegram}</span>
                    </a>
                  )}

                  {/* Official Telegram Channel Link */}
                  <a
                    href="https://t.me/OSot_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 py-2.5 px-3 text-xs text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Send size={14} className="text-sky-500" />
                      <span>Rasmiy Telegram Kanalimiz</span>
                    </span>
                    <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold">
                      @OSot_uz
                    </span>
                  </a>

                  {/* Moderation Actions: Report & Block Seller */}
                  <div className="flex items-center justify-between pt-2.5 px-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={handleReport}
                      className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <span>Shikoyat qilish</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBlockSeller}
                      className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <Ban size={14} className="text-slate-400 shrink-0" />
                      <span>Sotuvchini bloklash</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Safe Deal Reassurance */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                      {t.safeDealTitle}
                    </h5>
                    <p className="mt-1 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90 leading-normal">
                      {t.safeDealDesc}
                    </p>
                    {onOpenInfoModal && (
                      <button
                        type="button"
                        onClick={() => onOpenInfoModal('delivery')}
                        className="mt-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Sotuvchidan yetkazish & xavfsiz xarid qoidalari</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Listings Section with Category & Subcategory Filtering */}
          <SimilarListingsSection
            currentListing={listing}
            allListings={allListings}
            currency={currency}
            lang={lang}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={(sim) => {
              onSelectListing(sim);
              modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Fullscreen Lightbox & Zoom Modal */}
      {isLightboxOpen && (
        <div
          id="listing-lightbox-overlay"
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none overflow-hidden"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800/80 z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & Counter */}
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                {activePhotoIndex + 1} / {listing.images.length}
              </span>
              <h3 className="text-sm font-medium text-slate-200 truncate hidden sm:block">
                {listing.title}
              </h3>
            </div>

            {/* Actions: Zoom buttons & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/60 text-slate-300">
                <button
                  type="button"
                  id="btn-lightbox-zoom-out"
                  onClick={() => setLightboxZoom((prev) => Math.max(Number((prev - 0.5).toFixed(1)), 1))}
                  disabled={lightboxZoom <= 1}
                  className="p-1.5 hover:bg-slate-700/80 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title={`${t.zoomOut} (-)`}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono px-2 py-0.5 min-w-[3.25rem] text-center font-bold text-slate-200">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  id="btn-lightbox-zoom-in"
                  onClick={() => setLightboxZoom((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 3))}
                  disabled={lightboxZoom >= 3}
                  className="p-1.5 hover:bg-slate-700/80 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title={`${t.zoomIn} (+)`}
                >
                  <ZoomIn size={16} />
                </button>
                {lightboxZoom !== 1 && (
                  <button
                    type="button"
                    id="btn-lightbox-reset-zoom"
                    onClick={() => setLightboxZoom(1)}
                    className="ml-1 px-1.5 py-1 hover:bg-slate-700/80 rounded-lg text-indigo-300 transition-colors cursor-pointer border-l border-slate-700 text-xs flex items-center gap-1"
                    title={t.resetZoom}
                  >
                    <RotateCcw size={13} />
                    <span className="hidden md:inline">{t.resetZoom}</span>
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                id="btn-lightbox-close"
                onClick={() => setIsLightboxOpen(false)}
                className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ml-1"
                title={`${t.close} (Esc)`}
              >
                <X size={16} />
                <span className="hidden sm:inline">Esc</span>
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div
            id="lightbox-canvas-area"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto touch-pan-y ${
              lightboxZoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoom((prev) => (prev === 1 ? 2 : 1));
            }}
          >
            <img
              src={listing.images[activePhotoIndex] || listing.images[0]}
              alt={listing.title}
              style={{
                transform: `scale(${lightboxZoom})`,
                transition: 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)'
              }}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none origin-center"
            />

            {/* Prev / Next Navigation Arrows */}
            {listing.images.length > 1 && (
              <>
                <button
                  type="button"
                  id="btn-lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 shadow-2xl transition-all hover:scale-110 cursor-pointer z-20"
                  title="Oldingi rasm (←)"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  id="btn-lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 shadow-2xl transition-all hover:scale-110 cursor-pointer z-20"
                  title="Keyingi rasm (→)"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip and Navigation Hint */}
          <div
            className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-2.5 z-20 flex flex-col items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(idx);
                    }}
                    className={`w-14 sm:w-16 h-10 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIndex === idx
                        ? 'border-indigo-500 ring-2 ring-indigo-400/50 scale-105 shadow-md opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-400 font-medium text-center">
              {t.lightboxHint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
