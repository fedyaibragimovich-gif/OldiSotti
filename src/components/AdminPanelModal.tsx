import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Users,
  AlertTriangle,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Crown,
  Flame,
  Eye,
  Ban,
  UserCheck,
  Save,
  Check,
  Send,
  CheckSquare,
  Loader2,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Listing, Language, Currency, PlatformSettings, ModerationReport } from '../types';
import { getTranslation } from '../data/translations';
import { categories } from '../data/categories';
import { formatPrice, USD_TO_UZS_RATE } from '../utils/formatters';
import { extractSellersFromListings, AdminSellerSummary } from '../data/adminData';
import {
  postListingToTelegram,
  testTelegramConnection,
  TelegramConnectionResponse,
  TelegramPostResponse
} from '../services/telegram';
import { subscribeToAuth, isAdminUser } from '../lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  listings: Listing[];
  onUpdateListing: (updated: Listing) => void | Promise<void>;
  onDeleteListing: (id: string) => void | Promise<void>;
  onSelectListing: (listing: Listing) => void;
  onResetCatalogDefaults: () => void | Promise<void>;
  platformSettings: PlatformSettings;
  onUpdatePlatformSettings: (settings: PlatformSettings) => Promise<void> | void;
  blockedSellerIds: string[];
  onToggleBlockSeller: (sellerId: string) => void | Promise<void>;
  verifiedSellerIds: string[];
  onToggleVerifySeller: (sellerId: string) => void | Promise<void>;
  reports: ModerationReport[];
  onUpdateReportStatus: (reportId: string, status: 'resolved' | 'dismissed') => void | Promise<void>;
  isDbConnected?: boolean;
  onResyncDb?: () => Promise<void> | void;
}

type AdminTab = 'dashboard' | 'listings' | 'users' | 'reports' | 'settings' | 'telegram';
type StatusFilter = 'all' | 'active' | 'reserved' | 'pending' | 'sold' | 'rejected';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    lang,
    currency,
    listings,
    onUpdateListing,
    onDeleteListing,
    onSelectListing,
    onResetCatalogDefaults,
    platformSettings,
    onUpdatePlatformSettings,
    blockedSellerIds,
    onToggleBlockSeller,
    verifiedSellerIds,
    onToggleVerifySeller,
    reports,
    onUpdateReportStatus
  } = props;

  const t = getTranslation(lang);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Listing filters
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<StatusFilter>('all');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('all');
  const [listingPromoFilter, setListingPromoFilter] = useState<'all' | 'vip' | 'top'>('all');

  // Modals & Action states
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [confirmDeleteListingId, setConfirmDeleteListingId] = useState<string | null>(null);
  const [confirmResetCatalog, setConfirmResetCatalog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingCatalog, setIsResettingCatalog] = useState(false);
  const [processingListingId, setProcessingListingId] = useState<string | null>(null);

  // Users filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterType, setUserFilterType] = useState<'all' | 'verified' | 'blocked'>('all');

  // Settings & feedback state
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(platformSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Telegram state
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<TelegramConnectionResponse | null>(null);
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [selectedListingToPostId, setSelectedListingToPostId] = useState(listings[0]?.id || '');
  const [isPostingToChannel, setIsPostingToChannel] = useState(false);
  const [telegramPostResult, setTelegramPostResult] = useState<TelegramPostResponse | null>(null);

  useEffect(() => subscribeToAuth(setCurrentUser), []);
  useEffect(() => setSettingsForm(platformSettings), [platformSettings]);

  useEffect(() => {
    if (listings.length && !listings.some((l) => l.id === selectedListingToPostId)) {
      setSelectedListingToPostId(listings[0].id);
    }
  }, [listings, selectedListingToPostId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveToast({ message, type });
    setTimeout(() => {
      setSaveToast(null);
    }, 3800);
  };

  const authorized = isAdminUser(currentUser);
  const sellers: AdminSellerSummary[] = useMemo(
    () => extractSellersFromListings(listings, blockedSellerIds, verifiedSellerIds),
    [listings, blockedSellerIds, verifiedSellerIds]
  );

  const metrics = useMemo(
    () => ({
      total: listings.length,
      active: listings.filter((l) => l.status === 'active').length,
      reserved: listings.filter((l) => l.status === 'reserved').length,
      pending: listings.filter((l) => l.status === 'pending').length,
      rejected: listings.filter((l) => l.status === 'rejected').length,
      sold: listings.filter((l) => l.status === 'sold').length,
      vip: listings.filter((l) => l.isVip).length,
      top: listings.filter((l) => l.isTop).length,
      totalViews: listings.reduce((a, l) => a + (l.viewsCount || 0), 0),
      totalValueUzs: listings.reduce(
        (a, l) => a + (l.currency === 'USD' ? l.price * USD_TO_UZS_RATE : l.price),
        0
      ),
      pendingReports: reports.filter((r) => r.status === 'pending').length
    }),
    [listings, reports]
  );

  const categoryStats = useMemo(
    () =>
      categories
        .map((cat) => {
          const count = listings.filter((l) => l.categoryId === cat.id).length;
          return {
            id: cat.id,
            name: cat.name[lang] || cat.name.uz,
            count,
            percentage: metrics.total ? Math.round((count / metrics.total) * 100) : 0
          };
        })
        .sort((a, b) => b.count - a.count),
    [listings, metrics.total, lang]
  );

  const filteredListings = useMemo(
    () =>
      listings.filter((item) => {
        if (listingStatusFilter !== 'all' && item.status !== listingStatusFilter) return false;
        if (listingCategoryFilter !== 'all' && item.categoryId !== listingCategoryFilter) return false;
        if (listingPromoFilter === 'vip' && !item.isVip) return false;
        if (listingPromoFilter === 'top' && !item.isTop) return false;
        if (listingSearchQuery.trim()) {
          const q = listingSearchQuery.toLowerCase();
          if (
            !item.title.toLowerCase().includes(q) &&
            !item.seller.name.toLowerCase().includes(q) &&
            !item.id.toLowerCase().includes(q) &&
            !item.seller.phone.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      }),
    [listings, listingStatusFilter, listingCategoryFilter, listingPromoFilter, listingSearchQuery]
  );

  const filteredSellers = useMemo(
    () =>
      sellers.filter((s) => {
        if (userFilterType === 'verified' && !s.isVerified) return false;
        if (userFilterType === 'blocked' && !s.isBlocked) return false;
        if (userSearchQuery.trim()) {
          const q = userSearchQuery.toLowerCase();
          if (!s.name.toLowerCase().includes(q) && !s.phone.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [sellers, userFilterType, userSearchQuery]
  );

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  if (!isOpen || !authorized) return null;

  // Handlers with async feedback
  const handleApproveListing = async (listing: Listing) => {
    setProcessingListingId(listing.id);
    try {
      await onUpdateListing({ ...listing, status: 'active', rejectionReason: undefined });
      showToast(`"${listing.title.slice(0, 20)}..." muvaffaqiyatli tasdiqlandi!`);
    } catch (err: any) {
      showToast(err?.message || 'Tasdiqlashda xatolik', 'error');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleConfirmRejectListing = async (listing: Listing) => {
    setProcessingListingId(listing.id);
    try {
      await onUpdateListing({
        ...listing,
        status: 'rejected',
        rejectionReason: rejectReasonText.trim() || 'Moderatsiya qoidalariga mos kelmadi'
      });
      setRejectingListingId(null);
      setRejectReasonText('');
      showToast(`"${listing.title.slice(0, 20)}..." rad etildi.`);
    } catch (err: any) {
      showToast(err?.message || 'Rad etishda xatolik', 'error');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleToggleVip = async (listing: Listing) => {
    setProcessingListingId(listing.id);
    try {
      const nextVip = !listing.isVip;
      await onUpdateListing({ ...listing, isVip: nextVip, isTop: nextVip ? true : listing.isTop });
      showToast(nextVip ? 'VIP maqomi berildi!' : 'VIP maqomi olib tashlandi.');
    } catch (err: any) {
      showToast(err?.message || 'VIP holatini o\'zgartirishda xatolik', 'error');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleToggleTop = async (listing: Listing) => {
    setProcessingListingId(listing.id);
    try {
      const nextTop = !listing.isTop;
      await onUpdateListing({ ...listing, isTop: nextTop });
      showToast(nextTop ? 'TOP maqomi berildi!' : 'TOP maqomi olib tashlandi.');
    } catch (err: any) {
      showToast(err?.message || 'TOP holatini o\'zgartirishda xatolik', 'error');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteListingId) return;
    setIsDeleting(true);
    try {
      await onDeleteListing(confirmDeleteListingId);
      showToast("E'lon o'chirildi!");
      setConfirmDeleteListingId(null);
    } catch (err: any) {
      showToast(err?.message || 'O\'chirishda xatolik yuz berdi', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTestTelegramConnection = async () => {
    setTelegramTesting(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramConnection(settingsForm.telegramBotToken, settingsForm.telegramChannelId);
      setTelegramTestResult(res);
      if (res.success) {
        showToast("Telegram bot va kanal bilan muvaffaqiyatli bog'lanildi!");
      } else {
        showToast(res.error || 'Telegram ulanishida ogohlantirish', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Ulanishda kutilmagan xatolik yuz berdi';
      setTelegramTestResult({ success: false, error: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setTelegramTesting(false);
    }
  };

  const handlePostSelectedListingToTelegram = async () => {
    const target = listings.find((l) => l.id === selectedListingToPostId);
    if (!target) {
      showToast("Telegramga yuborish uchun e'lon topilmadi", 'error');
      return;
    }
    setIsPostingToChannel(true);
    setTelegramPostResult(null);
    try {
      const res = await postListingToTelegram(target, {
        channelId: settingsForm.telegramChannelId,
        botToken: settingsForm.telegramBotToken
      });
      setTelegramPostResult(res);
      if (res.success) {
        await onUpdateListing({
          ...target,
          isPostedToTelegram: true,
          telegramMessageId: res.messageId,
          telegramPostedAt: new Date().toISOString()
        });
        showToast(`"${target.title.slice(0, 22)}..." Telegram kanalga joylandi!`);
      } else {
        showToast(res.error || 'Kanalga yuborishda xatolik', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Kanalga yuborishda xatolik yuz berdi';
      setTelegramPostResult({ success: false, error: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setIsPostingToChannel(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onUpdatePlatformSettings(settingsForm);
      showToast(t.adminSettingsSaved || 'Sozlamalar muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      showToast(err?.message || 'Sozlamalarni saqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetCatalog = async () => {
    setIsResettingCatalog(true);
    try {
      await onResetCatalogDefaults();
      setConfirmResetCatalog(false);
      showToast('Katalog standart holatga muvaffaqiyatli qaytarildi!');
    } catch (err: any) {
      showToast(err?.message || 'Katalog ma\'lumotlarini tiklashda xatolik', 'error');
    } finally {
      setIsResettingCatalog(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/70 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Oldisotti <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
                </h2>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] px-2.5 py-0.5 border border-indigo-200 dark:border-indigo-800">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.adminStatsTitle} & e'lonlar markaziy boshqaruvi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border animate-in fade-in duration-200 ${
                  saveToast.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {saveToast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{saveToast.message}</span>
              </div>
            )}
            <button
              id="admin-close-btn"
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300/70 dark:hover:bg-slate-700 transition"
              aria-label="Yopish"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {(
            [
              ['dashboard', LayoutDashboard, 'Dashboard'],
              ['listings', Package, "E'lonlar"],
              ['users', Users, 'Foydalanuvchilar'],
              ['reports', AlertTriangle, 'Shikoyatlar'],
              ['settings', Settings, 'Sozlamalar'],
              ['telegram', Send, 'Telegram']
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
              {id === 'reports' && pendingReportsCount > 0 && (
                <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  ['Jami e\'lonlar', metrics.total],
                  ['Faol', metrics.active],
                  ['Band', metrics.reserved],
                  ['Kutilmoqda', metrics.pending],
                  ['Sotilgan', metrics.sold],
                  ['Rad etilgan', metrics.rejected],
                  ['VIP', metrics.vip],
                  ['TOP', metrics.top],
                  ['Ko‘rishlar', metrics.totalViews],
                  ['Kutilayotgan shikoyat', metrics.pendingReports],
                  ['Katalog qiymati', formatPrice(metrics.totalValueUzs, currency)]
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4"
                  >
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="text-xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="font-black text-slate-900 dark:text-white mb-4">Kategoriyalar bo'yicha e'lonlar</h3>
                <div className="space-y-2.5">
                  {categoryStats.slice(0, 10).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-36 truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {c.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-10 text-right text-slate-500 dark:text-slate-400">
                        {c.count} ({c.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={listingSearchQuery}
                    onChange={(e) => setListingSearchQuery(e.target.value)}
                    placeholder="E'lon nomi, sotuvchi yoki ID..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as StatusFilter)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Barcha statuslar</option>
                  <option value="active">Faol</option>
                  <option value="reserved">Band</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="sold">Sotilgan</option>
                  <option value="rejected">Rad etilgan</option>
                </select>
                <select
                  value={listingPromoFilter}
                  onChange={(e) => setListingPromoFilter(e.target.value as any)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Barcha promo</option>
                  <option value="vip">Faqat VIP</option>
                  <option value="top">Faqat TOP</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredListings.map((l) => {
                  const isProcessing = processingListingId === l.id;
                  return (
                    <div
                      key={l.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                    >
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition">
                            {l.title}
                          </span>
                          {l.isVip && (
                            <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                              VIP
                            </span>
                          )}
                          {l.isTop && (
                            <span className="bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                              TOP
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatPrice(l.price, l.currency)} · {l.seller.name} · {l.seller.phone} ·{' '}
                          <span
                            className={`font-semibold ${
                              l.status === 'active'
                                ? 'text-emerald-600'
                                : l.status === 'pending'
                                ? 'text-amber-600'
                                : l.status === 'rejected'
                                ? 'text-rose-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectListing(l)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Ko‘rish"
                        >
                          <Eye size={17} />
                        </button>

                        {l.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApproveListing(l)}
                              className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition disabled:opacity-50"
                              title="Tasdiqlash"
                            >
                              {isProcessing ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setRejectingListingId(l.id)}
                              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-50"
                              title="Rad etish"
                            >
                              <XCircle size={17} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleToggleVip(l)}
                          className={`p-2 rounded-xl transition ${
                            l.isVip
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          } disabled:opacity-50`}
                          title={l.isVip ? "VIP o'chirish" : "VIP berish"}
                        >
                          <Crown size={17} />
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleToggleTop(l)}
                          className={`p-2 rounded-xl transition ${
                            l.isTop
                              ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          } disabled:opacity-50`}
                          title={l.isTop ? "TOP o'chirish" : "TOP berish"}
                        >
                          <Flame size={17} />
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setConfirmDeleteListingId(l.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-50"
                          title="O‘chirish"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!filteredListings.length && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Mos keladigan e'lonlar topilmadi.
                  </div>
                )}
              </div>

              {/* Rejection Modal */}
              {rejectingListingId && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">E'lonni rad etish</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sotuvchiga rad etish sababini ko'rsating. Bu bildirishnoma sifatida yuboriladi.
                    </p>
                    <textarea
                      value={rejectReasonText}
                      onChange={(e) => setRejectReasonText(e.target.value)}
                      placeholder="Masalan: Narx asossiz yoki rasm sifati talabga javob bermaydi..."
                      className="w-full min-h-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingListingId(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={processingListingId === rejectingListingId}
                        onClick={() => {
                          const l = listings.find((x) => x.id === rejectingListingId);
                          if (l) handleConfirmRejectListing(l);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {processingListingId === rejectingListingId ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : null}
                        Rad etish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Deletion Confirmation Modal */}
              {confirmDeleteListingId && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                      <Trash2 size={24} />
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">E'lonni o'chirish</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Haqiqatan ham bu e'lonni butunlay o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteListingId(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleConfirmDelete}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Users */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <input
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
                  className="flex-1 min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={userFilterType}
                  onChange={(e) => setUserFilterType(e.target.value as any)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Barcha foydalanuvchilar</option>
                  <option value="verified">Faqat tasdiqlanganlar</option>
                  <option value="blocked">Faqat bloklanganlar</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredSellers.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</span>
                        {s.isVerified && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check size={10} /> Tasdiqlangan
                          </span>
                        )}
                        {s.isBlocked && (
                          <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                            Bloklangan
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.phone} · {s.listingsCount} ta e'lon · Ro'yxatdan o'tgan: {s.registeredSince}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await onToggleVerifySeller(s.id);
                          showToast(
                            s.isVerified ? "Tasdiqlangan maqomi olib tashlandi" : "Foydalanuvchi tasdiqlandi!"
                          );
                        }}
                        className={`p-2.5 rounded-xl border transition ${
                          s.isVerified
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={s.isVerified ? "Tasdiqni bekor qilish" : "Sotuvchini tasdiqlash"}
                      >
                        {s.isVerified ? <UserCheck size={17} /> : <CheckSquare size={17} />}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await onToggleBlockSeller(s.id);
                          showToast(s.isBlocked ? "Foydalanuvchi blokdan chiqarildi" : "Foydalanuvchi bloklandi!");
                        }}
                        className={`p-2.5 rounded-xl border transition ${
                          s.isBlocked
                            ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
                            : 'border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        }`}
                        title={s.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                      >
                        <Ban size={17} />
                      </button>
                    </div>
                  </div>
                ))}

                {!filteredSellers.length && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Foydalanuvchilar topilmadi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{r.listingTitle}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                          : r.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sabab: <span className="font-semibold">{r.reason}</span> · {r.createdAt}
                  </div>
                  {r.comment && (
                    <div className="text-xs mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                      "{r.comment}"
                    </div>
                  )}
                  {r.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateReportStatus(r.id, 'resolved');
                          showToast("Shikoyat hal qilindi!");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Hal qilish
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateReportStatus(r.id, 'dismissed');
                          showToast("Shikoyat rad etildi");
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {!reports.length && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  Hozircha shikoyatlar mavjud emas.
                </div>
              )}
            </div>
          )}

          {/* 5. Platform Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4">Platforma boshqaruv sozlamalari</h3>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          E'lonlarni avtomatik tasdiqlash
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Yangi e'lonlar moderatsiyasiz to'g'ridan-to'g'ri faollashadi
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.autoApproveListings}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, autoApproveListings: e.target.checked })
                        }
                        className="w-5 h-5 rounded-md accent-indigo-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          Texnik xizmat ko'rsatish rejimi
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Foydalanuvchilarga sayt vaqtincha yangilanayotgani haqida banner ko'rsatiladi
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.maintenanceMode}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })
                        }
                        className="w-5 h-5 rounded-md accent-indigo-600"
                      />
                    </label>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                        VIP xizmati kunlik narxi (UZS)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.vipPricePerDay}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, vipPricePerDay: Number(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      O'zgarishlar Firestore orqali real vaqtda saqlanadi
                    </span>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSavingSettings ? 'Saqlanmoqda…' : 'Sozlamalarni saqlash'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Reset Catalog Section */}
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 p-5 bg-rose-50/40 dark:bg-rose-950/20">
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300">
                  Standart katalog ma'lumotlarini tiklash
                </h4>
                <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-1 mb-4">
                  Barcha test e'lonlarini tozalab, rasmiy standart mock katalog e'lonlarini qayta tiklaydi.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmResetCatalog(true)}
                  className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 transition flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Katalogni standart holatga qaytarish
                </button>
              </div>

              {/* Reset Catalog Confirm Modal */}
              {confirmResetCatalog && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Katalogni tiklash</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Barcha e'lonlar standart mock katalog bilan almashtiriladi. Davom etishni xohlaysizmi?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmResetCatalog(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={isResettingCatalog}
                        onClick={handleResetCatalog}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isResettingCatalog ? <Loader2 size={16} className="animate-spin" /> : null}
                        Tiklash
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Telegram Bot & Channel */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white">Telegram Bot & Kanal integratsiyasi</h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    Kanal: {settingsForm.telegramChannelId || '@OSot_uz'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Telegram Bot Token (@BotFather'dan olingan)
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsTokenVisible(!isTokenVisible)}
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        {isTokenVisible ? 'Yashirish' : "Ko'rsatish"}
                      </button>
                    </div>
                    <input
                      value={settingsForm.telegramBotToken || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotToken: e.target.value })}
                      type={isTokenVisible ? 'text' : 'password'}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kanal ID yoki username
                      </label>
                      <input
                        value={settingsForm.telegramChannelId || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelId: e.target.value })}
                        placeholder="@OSot_uz"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bot username
                      </label>
                      <input
                        value={settingsForm.telegramBotUsername || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotUsername: e.target.value })}
                        placeholder="OSotBot"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={telegramTesting}
                    onClick={handleTestTelegramConnection}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {telegramTesting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {telegramTesting ? 'Tekshirilmoqda…' : 'Ulanishni tekshirish'}
                  </button>

                  <button
                    type="button"
                    disabled={isSavingSettings}
                    onClick={async () => {
                      setIsSavingSettings(true);
                      try {
                        await onUpdatePlatformSettings(settingsForm);
                        showToast("Telegram sozlamalari saqlandi!");
                      } catch (err: any) {
                        showToast("Saqlashda xatolik yuz berdi", "error");
                      } finally {
                        setIsSavingSettings(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Sozlamalarni saqlash
                  </button>
                </div>

                {telegramTestResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl border text-xs font-semibold ${
                      telegramTestResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {telegramTestResult.success
                      ? `✅ Ulanish muvaffaqiyatli: Bot ${telegramTestResult.botUsername || 'OldiSotti'}, Kanal: ${
                          telegramTestResult.channelTitle || settingsForm.telegramChannelId || '@OSot_uz'
                        }`
                      : `❌ Xatolik: ${telegramTestResult.error}`}
                  </div>
                )}

                {/* Broadcast Listing Section */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                    Kanalga e'lon joylash (Broadcast)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Kanalga yubormoqchi bo'lgan e'loningizni tanlang va tugmani bosing:
                  </p>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    <select
                      value={selectedListingToPostId}
                      onChange={(e) => setSelectedListingToPostId(e.target.value)}
                      className="flex-1 min-w-[260px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white font-medium"
                    >
                      {listings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title.slice(0, 45)} ({formatPrice(l.price, l.currency)})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={isPostingToChannel || !listings.length}
                      onClick={handlePostSelectedListingToTelegram}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {isPostingToChannel ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {isPostingToChannel ? 'Yuborilmoqda…' : "Kanalga e'lonni yuborish"}
                    </button>
                  </div>

                  {telegramPostResult && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs font-semibold ${
                        telegramPostResult.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {telegramPostResult.success
                        ? `✅ E'lon kanalga muvaffaqiyatli joylandi! (Message ID: ${telegramPostResult.messageId || 'yuborildi'})`
                        : `❌ Kanalga yuborilmadi: ${telegramPostResult.error}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
