import React, { useState, useMemo } from 'react';
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
  EyeOff,
  RefreshCw,
  Ban,
  UserCheck,
  Megaphone,
  Save,
  Check,
  TrendingUp,
  Tag,
  ExternalLink,
  ChevronRight,
  Filter,
  Database,
  Send,
  SendHorizontal,
  Bot,
  Radio,
  Share2,
  Copy,
  Sparkles,
  Info,
  CheckSquare
} from 'lucide-react';
import { Listing, Language, Currency, PlatformSettings, ModerationReport } from '../types';
import { getTranslation } from '../data/translations';
import { categories } from '../data/categories';
import { formatPrice, USD_TO_UZS_RATE } from '../utils/formatters';
import { extractSellersFromListings, AdminSellerSummary } from '../data/adminData';
import {
  postListingToTelegram,
  testTelegramConnection,
  createTelegramShareUrl,
  formatTelegramPostPreview,
  TelegramConnectionResponse,
  TelegramPostResponse
} from '../services/telegram';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  listings: Listing[];
  onUpdateListing: (updated: Listing) => void;
  onDeleteListing: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onResetCatalogDefaults: () => void;
  platformSettings: PlatformSettings;
  onUpdatePlatformSettings: (settings: PlatformSettings) => void;
  blockedSellerIds: string[];
  onToggleBlockSeller: (sellerId: string) => void;
  verifiedSellerIds: string[];
  onToggleVerifySeller: (sellerId: string) => void;
  reports: ModerationReport[];
  onUpdateReportStatus: (reportId: string, status: 'resolved' | 'dismissed') => void;
  isDbConnected?: boolean;
  onResyncDb?: () => Promise<void> | void;
}

type AdminTab = 'dashboard' | 'listings' | 'users' | 'reports' | 'settings' | 'telegram';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
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
  onUpdateReportStatus,
  isDbConnected = false,
  onResyncDb
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Listings Tab Filters
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'rejected'>('all');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<string>('all');
  const [listingPromoFilter, setListingPromoFilter] = useState<'all' | 'vip' | 'top'>('all');
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState<string>('');

  // Users Tab Filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterType, setUserFilterType] = useState<'all' | 'verified' | 'blocked'>('all');

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(platformSettings);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Telegram Integration States
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<TelegramConnectionResponse | null>(null);
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [selectedListingToPostId, setSelectedListingToPostId] = useState<string>(
    listings[0]?.id || ''
  );
  const [isPostingToChannel, setIsPostingToChannel] = useState(false);
  const [telegramPostResult, setTelegramPostResult] = useState<TelegramPostResponse | null>(null);

  // Sync settings form when prop updates
  React.useEffect(() => {
    setSettingsForm(platformSettings);
  }, [platformSettings]);

  // Sellers calculation
  const sellers: AdminSellerSummary[] = useMemo(() => {
    return extractSellersFromListings(listings, blockedSellerIds, verifiedSellerIds);
  }, [listings, blockedSellerIds, verifiedSellerIds]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((l) => l.status === 'active').length;
    const pending = listings.filter((l) => l.status === 'pending').length;
    const rejected = listings.filter((l) => l.status === 'rejected').length;
    const sold = listings.filter((l) => l.status === 'sold').length;
    const vip = listings.filter((l) => l.isVip).length;
    const top = listings.filter((l) => l.isTop).length;
    const totalViews = listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);

    // Catalog value
    const totalValueUzs = listings.reduce((acc, l) => {
      const priceInUzs = l.currency === 'USD' ? l.price * USD_TO_UZS_RATE : l.price;
      return acc + priceInUzs;
    }, 0);

    return {
      total,
      active,
      pending,
      rejected,
      sold,
      vip,
      top,
      totalViews,
      totalValueUzs
    };
  }, [listings]);

  // Category counts
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const count = listings.filter((l) => l.categoryId === cat.id).length;
      const percentage = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
      return {
        id: cat.id,
        name: cat.name[lang] || cat.name.uz,
        count,
        percentage
      };
    }).sort((a, b) => b.count - a.count);
  }, [categories, listings, metrics.total, lang]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (listingStatusFilter !== 'all' && item.status !== listingStatusFilter) {
        return false;
      }
      if (listingCategoryFilter !== 'all' && item.categoryId !== listingCategoryFilter) {
        return false;
      }
      if (listingPromoFilter === 'vip' && !item.isVip) {
        return false;
      }
      if (listingPromoFilter === 'top' && !item.isTop) {
        return false;
      }
      if (listingSearchQuery.trim()) {
        const q = listingSearchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSeller = item.seller.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesPhone = item.seller.phone.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSeller && !matchesId && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [listings, listingStatusFilter, listingCategoryFilter, listingPromoFilter, listingSearchQuery]);

  // Filtered Sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (userFilterType === 'verified' && !s.isVerified) return false;
      if (userFilterType === 'blocked' && !s.isBlocked) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchPhone = s.phone.toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [sellers, userFilterType, userSearchQuery]);

  // Pending reports
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  if (!isOpen) return null;

  // Handlers for Listing moderation
  const handleApproveListing = (listing: Listing) => {
    onUpdateListing({
      ...listing,
      status: 'active',
      rejectionReason: undefined
    });
  };

  const handleConfirmRejectListing = (listing: Listing) => {
    onUpdateListing({
      ...listing,
      status: 'rejected',
      rejectionReason: rejectReasonText.trim() || 'Moderatsiya qoidalariga mos kelmadi'
    });
    setRejectingListingId(null);
    setRejectReasonText('');
  };

  const handleToggleVip = (listing: Listing) => {
    onUpdateListing({
      ...listing,
      isVip: !listing.isVip
    });
  };

  const handleToggleTop = (listing: Listing) => {
    onUpdateListing({
      ...listing,
      isTop: !listing.isTop
    });
  };

  const handleTestTelegramConnection = async () => {
    setTelegramTesting(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramConnection(
        settingsForm.telegramBotToken,
        settingsForm.telegramChannelId
      );
      setTelegramTestResult(res);
      if (res.success) {
        setSaveToast("✅ Telegram bot va kanal bilan muvaffaqiyatli bog'lanildi!");
      } else {
        setSaveToast("⚠️ Telegram ulanishida ogohlantirish");
      }
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err: any) {
      setTelegramTestResult({
        success: false,
        error: err.message || "Ulanishda kutilmagan xatolik yuz berdi"
      });
    } finally {
      setTelegramTesting(false);
    }
  };

  const handlePostSelectedListingToTelegram = async () => {
    const target = listings.find((l) => l.id === selectedListingToPostId);
    if (!target) return;

    setIsPostingToChannel(true);
    setTelegramPostResult(null);
    try {
      const res = await postListingToTelegram(target, {
        channelId: settingsForm.telegramChannelId,
        botToken: settingsForm.telegramBotToken
      });
      setTelegramPostResult(res);

      if (res.success) {
        const updated: Listing = {
          ...target,
          isPostedToTelegram: true,
          telegramMessageId: res.messageId,
          telegramPostedAt: new Date().toISOString()
        };
        onUpdateListing(updated);
        setSaveToast(`📢 "${target.title.slice(0, 22)}..." Telegram kanalga joylandi!`);
        setTimeout(() => setSaveToast(null), 3500);
      }
    } catch (err: any) {
      setTelegramPostResult({
        success: false,
        error: err.message || "Kanalga yuborishda xatolik yuz berdi"
      });
    } finally {
      setIsPostingToChannel(false);
    }
  };

  const handleQuickBroadcastToTelegram = async (listing: Listing) => {
    try {
      const res = await postListingToTelegram(listing, {
        channelId: settingsForm.telegramChannelId,
        botToken: settingsForm.telegramBotToken
      });
      if (res.success) {
        const updated: Listing = {
          ...listing,
          isPostedToTelegram: true,
          telegramMessageId: res.messageId,
          telegramPostedAt: new Date().toISOString()
        };
        onUpdateListing(updated);
        setSaveToast(`📢 "${listing.title.slice(0, 18)}..." kanalga yuborildi!`);
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (err) {
      console.warn('Quick broadcast error:', err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlatformSettings(settingsForm);
    setSaveToast(t.adminSettingsSaved || 'Sozlamalar muvaffaqiyatli saqlandi!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/70 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Oldisotti <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
                </h2>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] px-2 py-0.5 border border-indigo-200 dark:border-indigo-800">
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
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
                <Check size={14} />
                <span>{saveToast}</span>
              </div>
            )}
            <button
              id="admin-close-btn"
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <button
            id="admin-tab-dashboard"
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>{t.adminDashboard}</span>
          </button>

          <button
            id="admin-tab-listings"
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package size={16} />
            <span>{t.adminListings}</span>
            {metrics.pending > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            id="admin-tab-users"
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={16} />
            <span>{t.adminUsers}</span>
            <span className="ml-1 text-[11px] opacity-75">({sellers.length})</span>
          </button>

          <button
            id="admin-tab-reports"
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle size={16} />
            <span>{t.adminReports}</span>
            {pendingReportsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            id="admin-tab-settings"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={16} />
            <span>{t.adminSettings}</span>
          </button>

          <button
            id="admin-tab-telegram"
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Send size={16} />
            <span>Telegram Bot & Kanal</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-black border border-sky-300 dark:border-sky-800">
              API
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Total Ads */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminTotalAds}</span>
                    <Package size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {metrics.total}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <span>{metrics.active} {t.adminActiveAds.toLowerCase()}</span>
                  </div>
                </div>

                {/* Pending Moderation */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminPendingAds}</span>
                    <AlertTriangle size={16} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {metrics.pending}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {metrics.pending > 0 ? "Tekshiruv kutilmoqda" : "Barchasi toza"}
                  </div>
                </div>

                {/* VIP & TOP Listings */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminVipAdsCount}</span>
                    <Crown size={16} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {metrics.vip + metrics.top}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {metrics.vip} VIP / {metrics.top} TOP
                  </div>
                </div>

                {/* Total Sellers */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminTotalUsersCount}</span>
                    <Users size={16} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {sellers.length}
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    {sellers.filter((s) => s.isVerified).length} {t.adminVerifiedBadge.toLowerCase()}
                  </div>
                </div>

                {/* Total Platform Views */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminTotalPlatformViews}</span>
                    <Eye size={16} className="text-purple-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {metrics.totalViews.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {(metrics.totalViews / (metrics.total || 1)).toFixed(1)} o'rtacha/e'lon
                  </div>
                </div>

                {/* Estimated Catalog GMV */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold">{t.adminEstCatalogValue}</span>
                    <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white truncate" title={`${metrics.totalValueUzs.toLocaleString()} UZS`}>
                    {(metrics.totalValueUzs / 1000000).toFixed(1)}M <span className="text-xs">UZS</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                    ~${Math.round(metrics.totalValueUzs / USD_TO_UZS_RATE).toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Cloud Database (Firebase Firestore) Status Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl shrink-0 ${isDbConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    <Database size={22} className={isDbConnected ? 'animate-pulse' : ''} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-white flex items-center gap-2">
                        Cloud Firestore Ma'lumotlar Bazasi
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isDbConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {isDbConnected ? '● Jonli Ulanish (Real-time Sync)' : '○ Ulanmoqda / Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      E'lonlar, suhbatlar, narxlar tarixi va administrator sozlamalari Google Cloud Firestore serverida doimiy saqlanadi va qurilmalararo jonli yangilanadi.
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5 flex-wrap">
                      <span>Proyekt: <strong className="text-slate-200">gen-lang-client-0261863601</strong></span>
                      <span>•</span>
                      <span>To'plamlar: <strong className="text-slate-200">listings, conversations, settings</strong></span>
                      <span>•</span>
                      <span>Jami e'lonlar: <strong className="text-slate-200">{listings.length} ta</strong></span>
                    </div>
                  </div>
                </div>
                {onResyncDb && (
                  <button
                    type="button"
                    onClick={onResyncDb}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Qayta sinxronlash</span>
                  </button>
                )}
              </div>

              {/* Moderation Alert Banner if pending items exist */}
              {metrics.pending > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                        {metrics.pending} ta e'lon moderatsiya tekshiruvini kutmoqda
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300/90">
                        E'lonlarni ko'rib chiqing va saytda chop etish yoki rad etish qarorini qabul qiling.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setListingStatusFilter('pending');
                      setActiveTab('listings');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Moderatsiyani ochish
                  </button>
                </div>
              )}

              {/* Two columns: Category Breakdown & Quick Recent Listings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag size={16} className="text-indigo-600 dark:text-indigo-400" />
                      Toifalar bo'yicha taqsimot
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {categories.length} toifa
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryStats.slice(0, 7).map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{cat.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {cat.count} ta ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fast Action / Recent Moderation Stream */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Package size={16} className="text-indigo-600 dark:text-indigo-400" />
                      So'nggi qo'shilgan e'lonlar
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('listings')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Barchasini ko'rish
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {listings.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-10 w-10 rounded-lg object-cover bg-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {formatPrice(item.price, item.currency, currency)} • {item.seller.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            item.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                              : item.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                              : item.status === 'rejected'
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectListing(item)}
                            title="Ko'rish"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: LISTINGS MANAGEMENT & MODERATION */}
          {/* ============================================================ */}
          {activeTab === 'listings' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Filtering Controls */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="admin-search-listings"
                      type="text"
                      value={listingSearchQuery}
                      onChange={(e) => setListingSearchQuery(e.target.value)}
                      placeholder="Sarlavha, sotuvchi, telefon yoki ID bo'yicha qidirish..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    id="admin-filter-category"
                    value={listingCategoryFilter}
                    onChange={(e) => setListingCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Barcha toifalar</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name[lang] || c.name.uz}
                      </option>
                    ))}
                  </select>

                  {/* Promotion Filter */}
                  <select
                    id="admin-filter-promo"
                    value={listingPromoFilter}
                    onChange={(e) => setListingPromoFilter(e.target.value as any)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Barcha darajalar</option>
                    <option value="vip">Faqat VIP</option>
                    <option value="top">Faqat TOP</option>
                  </select>
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden pt-1">
                  {(['all', 'active', 'pending', 'sold', 'rejected'] as const).map((status) => {
                    const count = status === 'all'
                      ? listings.length
                      : listings.filter((l) => l.status === status).length;
                    const isSelected = listingStatusFilter === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setListingStatusFilter(status)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="capitalize">
                          {status === 'all' ? 'Barchasi' : status === 'active' ? 'Faol' : status === 'pending' ? 'Moderatsiyada' : status === 'sold' ? 'Sotilgan' : 'Rad etilgan'}
                        </span>
                        <span className="text-[10px] opacity-80 px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/20">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rejection Prompt Modal inline */}
              {rejectingListingId && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                      E'lonni rad etish sababini tasdiqlang:
                    </h4>
                    <button
                      type="button"
                      onClick={() => setRejectingListingId(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rejectReasonText}
                    onChange={(e) => setRejectReasonText(e.target.value)}
                    placeholder={t.adminReasonPlaceholder}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setRejectingListingId(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = listings.find((l) => l.id === rejectingListingId);
                        if (target) handleConfirmRejectListing(target);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                    >
                      {t.adminQuickReject}
                    </button>
                  </div>
                </div>
              )}

              {/* Listings Table / Cards */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredListings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Hech qanday e'lon topilmadi.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        {/* Info Left */}
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Status Badge */}
                              <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                  : item.status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                  : item.status === 'rejected'
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {item.status}
                              </span>

                              {/* VIP badge */}
                              {item.isVip && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                                  <Crown size={11} />
                                  VIP
                                </span>
                              )}

                              {/* TOP badge */}
                              {item.isTop && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                                  <Flame size={11} />
                                  TOP
                                </span>
                              )}

                              <span className="text-[11px] text-slate-400 font-mono">
                                #{item.id}
                              </span>
                            </div>

                            <h4
                              onClick={() => onSelectListing(item)}
                              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                            >
                              {item.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-black text-slate-900 dark:text-white">
                                {formatPrice(item.price, item.currency, currency)}
                              </span>
                              <span>•</span>
                              <span>{item.seller.name} ({item.seller.phone})</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye size={12} /> {item.viewsCount}
                              </span>
                            </div>

                            {item.rejectionReason && (
                              <p className="text-xs text-rose-600 dark:text-rose-400 italic">
                                Rad sababi: {item.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Right */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:self-center shrink-0">
                          {/* Approve / Activate */}
                          {item.status !== 'active' && (
                            <button
                              type="button"
                              onClick={() => handleApproveListing(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title={t.adminQuickApprove}
                            >
                              <CheckCircle2 size={14} />
                              <span>{t.adminQuickApprove}</span>
                            </button>
                          )}

                          {/* Reject */}
                          {item.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => setRejectingListingId(item.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/70 dark:hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title={t.adminQuickReject}
                            >
                              <XCircle size={14} />
                              <span className="hidden sm:inline">{t.adminQuickReject}</span>
                            </button>
                          )}

                          {/* VIP toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleVip(item)}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              item.isVip
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={item.isVip ? t.adminRemoveVipBadge : t.adminMakeVipBadge}
                          >
                            <Crown size={14} />
                            <span className="hidden md:inline">VIP</span>
                          </button>

                          {/* TOP toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleTop(item)}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              item.isTop
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={item.isTop ? t.adminRemoveTopBadge : t.adminMakeTopBadge}
                          >
                            <Flame size={14} />
                            <span className="hidden md:inline">TOP</span>
                          </button>

                          {/* Quick Telegram broadcast button */}
                          <button
                            type="button"
                            onClick={() => handleQuickBroadcastToTelegram(item)}
                            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              item.isPostedToTelegram
                                ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50'
                            }`}
                            title={item.isPostedToTelegram ? "Telegram kanalga yuborilgan (qayta yuborish)" : "Telegram kanalga yuborish"}
                          >
                            <Send size={13} />
                            <span className="hidden xl:inline">{item.isPostedToTelegram ? 'Kanalda' : 'TG Kanal'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(t.adminConfirmDelete)) {
                                onDeleteListing(item.id);
                              }
                            }}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={t.adminDeleteListing}
                          >
                            <Trash2 size={15} />
                          </button>

                          {/* Preview Details */}
                          <button
                            type="button"
                            onClick={() => onSelectListing(item)}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            title="Ko'rish"
                          >
                            <ExternalLink size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: USERS & SELLERS */}
          {/* ============================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-search-users"
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUserFilterType('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      userFilterType === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Barchasi ({sellers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilterType('verified')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      userFilterType === 'verified'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t.adminVerifiedBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilterType('blocked')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      userFilterType === 'blocked'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t.adminBlockedBadge}
                  </button>
                </div>
              </div>

              {/* Sellers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {seller.avatar ? (
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="h-12 w-12 rounded-2xl object-cover bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-sm shrink-0">
                          {seller.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {seller.name}
                          </h4>
                          {seller.isVerified && (
                            <span className="text-blue-500" title="Tasdiqlangan">
                              <UserCheck size={16} />
                            </span>
                          )}
                          {seller.isBlocked && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-black">
                              {t.adminBlockedBadge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {seller.phone}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{seller.listingsCount} ta e'lon ({seller.activeCount} faol)</span>
                          <span>•</span>
                          <span>{seller.totalViews} ko'rishlar</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {/* Toggle Verification */}
                      <button
                        type="button"
                        onClick={() => onToggleVerifySeller(seller.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          seller.isVerified
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {seller.isVerified ? t.adminUnverifySeller : t.adminVerifySeller}
                      </button>

                      {/* Toggle Block */}
                      <button
                        type="button"
                        onClick={() => onToggleBlockSeller(seller.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          seller.isBlocked
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700'
                        }`}
                      >
                        {seller.isBlocked ? t.adminUnblockSeller : t.adminBlockSeller}
                      </button>

                      {/* Filter this seller's ads in listings tab */}
                      <button
                        type="button"
                        onClick={() => {
                          setListingSearchQuery(seller.name);
                          setActiveTab('listings');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-center"
                      >
                        E'lonlarini ko'rish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: REPORTS & FLAGGED ITEMS */}
          {/* ============================================================ */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {reports.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    {t.adminNoPending}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reports.map((report) => {
                      const relatedListing = listings.find((l) => l.id === report.listingId);
                      return (
                        <div
                          key={report.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-black rounded-md uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                {report.reason}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {report.createdAt}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                report.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {report.status}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {report.listingTitle}
                            </h4>

                            {report.comment && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Shikoyat izohi:</span> "{report.comment}"
                              </p>
                            )}

                            {report.reporterPhone && (
                              <p className="text-[11px] text-slate-400">
                                Yuboruvchi: {report.reporterPhone}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {relatedListing && (
                              <button
                                type="button"
                                onClick={() => onSelectListing(relatedListing)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                              >
                                E'lonni ko'rish
                              </button>
                            )}

                            {report.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateReportStatus(report.id, 'resolved')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  Hal etildi (Saqlash)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (relatedListing) {
                                      onUpdateListing({
                                        ...relatedListing,
                                        status: 'rejected',
                                        rejectionReason: `Shikoyat bo'yicha olib tashlandi (${report.reason})`
                                      });
                                    }
                                    onUpdateReportStatus(report.id, 'resolved');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  E'lonni o'chirish
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SYSTEM & PLATFORM SETTINGS */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* General Toggles */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.adminPlatformSettingsTitle}
                  </h3>

                  {/* Auto approve */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block">
                        {t.adminAutoApproveToggle}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.adminAutoApproveDesc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.autoApproveListings}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            autoApproveListings: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block">
                        {t.adminMaintenanceToggle}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.adminMaintenanceDesc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.maintenanceMode}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            maintenanceMode: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {/* VIP price */}
                  <div className="py-2 space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block">
                      {t.adminVipDailyPrice}
                    </label>
                    <input
                      type="number"
                      value={settingsForm.vipPricePerDay}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          vipPricePerDay: Number(e.target.value) || 0
                        }))
                      }
                      className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Broadcast Banner */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone size={18} className="text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t.adminBroadcastBanner}
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.isAnnouncementActive}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            isAnnouncementActive: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    value={settingsForm.announcementText}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        announcementText: e.target.value
                      }))
                    }
                    placeholder="Platforma foydalanuvchilariga ko'rsatiladigan umumiy xabar..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{t.adminSaveSettingsBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Barcha e'lonlar bazasini boshlang'ich namunaviy holatiga qaytarishni xohlaysizmi?")) {
                        onResetCatalogDefaults();
                        setSaveToast(t.adminResetSuccess || "Baza asl holatiga qaytarildi!");
                        setTimeout(() => setSaveToast(null), 3000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={15} />
                    <span>{t.adminResetDataBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: TELEGRAM BOT & KANAL INTEGRATSIYASI */}
          {/* ============================================================ */}
          {activeTab === 'telegram' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-br from-sky-500/10 via-sky-600/5 to-indigo-500/10 dark:from-sky-950/40 dark:via-slate-900 dark:to-indigo-950/30 rounded-3xl p-5 sm:p-6 border border-sky-200 dark:border-sky-800/60 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/30 shrink-0">
                      <Send size={24} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Telegram Bot & Kanal Integratsiyasi
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 text-[11px] font-black border border-sky-300 dark:border-sky-700">
                          {settingsForm.autoPostListingsToTelegram ? "Avto-chop etish Faol" : "Qo'lda boshqarish"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                        Saytga qo'shilgan e'lonlarni bir zumda rasmiy <strong>{settingsForm.telegramChannelId || '@oldisotti_uz'}</strong> Telegram kanaliga yuboring, yangi xabarlar haqida sotuvchilarni bot orqali ogohlantiring.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href={`https://t.me/${(settingsForm.telegramChannelId || '@oldisotti_uz').replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <ExternalLink size={14} className="text-sky-500" />
                      <span>Kanalni ochish</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleTestTelegramConnection}
                      disabled={telegramTesting}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} className={telegramTesting ? 'animate-spin' : ''} />
                      <span>{telegramTesting ? "Tekshirilmoqda..." : "Ulanishni tekshirish"}</span>
                    </button>
                  </div>
                </div>

                {/* Test Connection Status Banner */}
                {telegramTestResult && (
                  <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
                    telegramTestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}>
                    {telegramTestResult.success ? (
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex flex-wrap items-center gap-2">
                        <span>{telegramTestResult.success ? "Telegram API aloqasi tasdiqlandi" : "Ulanishda ogohlantirish"}</span>
                        {telegramTestResult.simulated && (
                          <span className="bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 text-[10px] px-2 py-0.5 rounded-md font-normal">
                            Simulyatsiya rejimi (Token kiritilsa haqiqiy botga ulanadi)
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 opacity-90 text-[11px]">
                        {telegramTestResult.error || telegramTestResult.message || `Bot: @${telegramTestResult.bot?.username || 'OldisottiBot'} | Kanal: ${settingsForm.telegramChannelId || '@oldisotti_uz'}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2-Column Layout: Settings on Left, Broadcaster & Live Mockup on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Configuration Form (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <Bot size={18} className="text-sky-500" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Bot va Kanal Parametrlari
                      </h4>
                    </div>

                    {/* Bot Token Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Telegram Bot Token</span>
                        <span className="text-[10px] text-slate-400 font-normal">@BotFather bergan token</span>
                      </label>
                      <div className="relative">
                        <input
                          type={isTokenVisible ? 'text' : 'password'}
                          value={settingsForm.telegramBotToken || ''}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              telegramBotToken: e.target.value
                            }))
                          }
                          placeholder="masalan: 7123456789:AAHq_..."
                          className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => setIsTokenVisible(!isTokenVisible)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isTokenVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Channel ID / Username Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Kanal Username yoki ID</span>
                        <span className="text-[10px] text-slate-400 font-normal">@belgisi bilan</span>
                      </label>
                      <input
                        type="text"
                        value={settingsForm.telegramChannelId || ''}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            telegramChannelId: e.target.value
                          }))
                        }
                        placeholder="@oldisotti_uz"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Bot Username Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bot Username
                      </label>
                      <input
                        type="text"
                        value={settingsForm.telegramBotUsername || ''}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            telegramBotUsername: e.target.value
                          }))
                        }
                        placeholder="OldisottiMarketBot"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Automation Switches */}
                    <div className="pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Auto post switch */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">
                            Avtomatik kanalga joylash
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                            Yangi e'lon berilganda avtomat kanalga yuborish
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={settingsForm.autoPostListingsToTelegram || false}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                autoPostListingsToTelegram: e.target.checked
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Only VIP switch */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">
                            Faqat VIP e'lonlarni yuborish
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                            Kanal lentasini tejash uchun faqat pullik/VIP e'lonlar
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={settingsForm.postOnlyVipToTelegram || false}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                postOnlyVipToTelegram: e.target.checked
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {/* Notify seller switch */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">
                            Chat xabarnomalarini botga yuborish
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                            Xaridor xabar yozganda sotuvchiga bildirish
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={settingsForm.notifySellerOnChat || false}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                notifySellerOnChat: e.target.checked
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                    </div>

                    {/* Save Settings Button */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={(e) => handleSaveSettings(e as any)}
                        className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                      >
                        <Save size={16} />
                        <span>Telegram sozlamalarini saqlash</span>
                      </button>
                    </div>
                  </div>

                  {/* Step-by-step connection guide */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-sky-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                        Kanalni ulash bo'yicha qo'llanma
                      </h4>
                    </div>
                    <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        Telegramda <code className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-[11px] text-sky-600">@BotFather</code> ga kiring va <code className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-[11px]">/newbot</code> buyrug'ini yuboring.
                      </li>
                      <li>
                        Bot nomini kiriting va olingan <strong>HTTP API Token</strong>ni yuqoridagi maydonga yozing.
                      </li>
                      <li>
                        O'zingizning Telegram kanalingizga kiring va yangi botingizni <strong>Administrator</strong> qilib qo'shing (Xabar yozish huquqi bilan).
                      </li>
                      <li>
                        Kanal usernameni (masalan, <code className="text-sky-600 font-bold">@oldisotti_uz</code>) kiritib, <strong>Ulanishni tekshirish</strong> tugmasini bosing!
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Right: Manual Broadcaster & Live Mockup (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <SendHorizontal size={18} className="text-sky-500" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Kanalga E'lon Yuborish & Jonli Namuna
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {listings.length} ta mavjud e'lon
                      </span>
                    </div>

                    {/* Listing selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kanalga chiqariladigan e'lonni tanlang:
                      </label>
                      <select
                        value={selectedListingToPostId}
                        onChange={(e) => {
                          setSelectedListingToPostId(e.target.value);
                          setTelegramPostResult(null);
                        }}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {listings.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.isVip ? '⭐ [VIP] ' : ''}
                            {item.title} — {formatPrice(item.price, item.currency, currency)} ({item.location.region})
                            {item.isPostedToTelegram ? ' [Avval yuborilgan]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Selected Listing Card & Preview */}
                    {(() => {
                      const selected = listings.find((l) => l.id === selectedListingToPostId) || listings[0];
                      if (!selected) return null;

                      return (
                        <div className="space-y-4">
                          {/* Broadcast Action Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={selected.images[0]}
                                alt={selected.title}
                                className="h-11 w-11 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {selected.title}
                                </h5>
                                <p className="text-[11px] font-black text-sky-600 dark:text-sky-400">
                                  {formatPrice(selected.price, selected.currency, currency)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={createTelegramShareUrl(selected)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 transition-colors shadow-xs"
                                title="Telegramda to'g'ridan-to'g'ri ulashish"
                              >
                                <Share2 size={13} />
                                <span>Ulashish</span>
                              </a>

                              <button
                                type="button"
                                onClick={handlePostSelectedListingToTelegram}
                                disabled={isPostingToChannel}
                                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/30 transition-all cursor-pointer"
                              >
                                <Send size={14} className={isPostingToChannel ? 'animate-bounce' : ''} />
                                <span>{isPostingToChannel ? "Yuborilmoqda..." : "Kanalga joylash"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Post Success / Notice Banner */}
                          {telegramPostResult && (
                            <div className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
                              telegramPostResult.success
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <div>
                                  <p className="font-bold">
                                    {telegramPostResult.success ? "E'lon kanalga muvaffaqiyatli uzatildi!" : "Yuborishda xatolik"}
                                  </p>
                                  <p className="text-[11px] opacity-80">
                                    Xabar ID: #{telegramPostResult.messageId || 1042} | Kanal: {telegramPostResult.channel || settingsForm.telegramChannelId || '@oldisotti_uz'}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`https://t.me/${(settingsForm.telegramChannelId || '@oldisotti_uz').replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shrink-0"
                              >
                                Kanalda ko'rish
                              </a>
                            </div>
                          )}

                          {/* Authentic Telegram Client Message Simulation Box */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Radio size={13} className="text-sky-500" />
                              <span>Telegram kanalida qanday ko'rinadi (Jonli Mockup):</span>
                            </span>

                            {/* Telegram Message Box Container */}
                            <div className="bg-[#548eaa]/15 dark:bg-slate-950/70 p-4 sm:p-5 rounded-3xl border border-sky-200/60 dark:border-slate-800 flex justify-center">
                              <div className="w-full max-w-md bg-white dark:bg-[#182533] rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
                                
                                {/* Telegram Header */}
                                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#17212b] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-black">
                                      O
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Oldisotti O'zbekiston
                                      </h6>
                                      <span className="text-[10px] text-sky-600 dark:text-sky-400">
                                        {settingsForm.telegramChannelId || '@oldisotti_uz'}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-400">12:45</span>
                                </div>

                                {/* Post Photo */}
                                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                                  <img
                                    src={selected.images[0]}
                                    alt={selected.title}
                                    className="w-full h-full object-cover"
                                  />
                                  {selected.isVip && (
                                    <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                      <Crown size={11} />
                                      VIP E'LON
                                    </span>
                                  )}
                                </div>

                                {/* Post Caption */}
                                <div className="p-3.5 space-y-2 text-xs leading-relaxed">
                                  <p className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                    📢 {selected.title}
                                  </p>
                                  <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-200">
                                    <p>💰 <strong>Narxi:</strong> {formatPrice(selected.price, selected.currency, currency)} {selected.isNegotiable ? "(kelishiladi)" : ""}</p>
                                    <p>📍 <strong>Manzil:</strong> {selected.location.region}{selected.location.district ? `, ${selected.location.district}` : ''}</p>
                                    <p>🏷️ <strong>Holati:</strong> {selected.condition === 'new' ? '✨ Yangi' : '🔄 Ishlatilgan'}</p>
                                    <p>{selected.isDeliveryAvailable ? "🚚 Yetkazib berish mavjud" : "📦 Samovivoz"}</p>
                                  </div>

                                  <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-3">
                                    "{selected.description}"
                                  </div>

                                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300">
                                    <p>👤 <strong>Sotuvchi:</strong> {selected.seller.name}</p>
                                    <p>📞 <strong>Aloqa:</strong> <span className="font-mono">{selected.seller.phone}</span></p>
                                    {selected.seller.telegram && (
                                      <p>✈️ <strong>Telegram:</strong> @{selected.seller.telegram.replace('@', '')}</p>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                                    #{selected.location.region.replace(/['`\s]/g, '')} #Oldisotti #Bozor
                                  </p>
                                </div>

                                {/* Simulated Inline Keyboard Buttons */}
                                <div className="p-2.5 pt-0 space-y-1.5">
                                  <a
                                    href={`/?listing=${selected.id}`}
                                    className="w-full py-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold text-xs text-center block transition-colors border border-sky-200 dark:border-sky-800"
                                  >
                                    🔍 E'lonni saytda ko'rish
                                  </a>
                                  {selected.seller.telegram && (
                                    <a
                                      href={`https://t.me/${selected.seller.telegram.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center block transition-colors"
                                    >
                                      💬 Sotuvchiga yozish
                                    </a>
                                  )}
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
