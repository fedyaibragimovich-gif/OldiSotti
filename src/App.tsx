import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  Language,
  Currency,
  FilterState,
  Conversation,
  ChatMessage,
  PlatformSettings,
  ModerationReport,
  AppNotification
} from './types';
import { mockListings, mockConversations } from './data/mockListings';
import { USD_TO_UZS_RATE } from './utils/formatters';
import { getTranslation } from './data/translations';
import { initialPlatformSettings, initialModerationReports } from './data/adminData';
import { AlertTriangle } from 'lucide-react';
import {
  subscribeToListings,
  fetchListingById,
  seedInitialListingsIfEmpty,
  saveListingToDb,
  updateListingInDb,
  deleteListingFromDb,
  incrementListingViewsInDb,
  subscribeToConversations,
  seedConversationsIfEmpty,
  saveConversationToDb,
  appendMessageInDb,
  subscribeToPlatformSettings,
  savePlatformSettingsToDb,
  subscribeToModerationReports,
  updateReportStatusInDb,
  blockSellerInDb,
  unblockSellerInDb,
  saveNotificationToDb
} from './lib/firebase';

// Components
import { Header } from './components/Header';
import { SearchBanner } from './components/SearchBanner';
import { CategoriesBar } from './components/CategoriesBar';
import { VipListings } from './components/VipListings';
import { ListingFilters } from './components/ListingFilters';
import { ListingCard } from './components/ListingCard';
import { ListingSkeletonGrid } from './components/ListingSkeleton';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { ChatDrawer } from './components/ChatDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { MyAdsModal } from './components/MyAdsModal';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { PopularBrandsBar } from './components/PopularBrandsBar';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { SafePurchasesSection } from './components/SafePurchasesSection';
import { InfoPagesModal } from './components/InfoPagesModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { InfoTabKey } from './data/infoPagesData';
import { postListingToTelegram, sendTelegramNotification } from './services/telegram';
import { subscribeToAuth, isAdminUser } from './lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // 1. Language & Currency & Dark Mode
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('olx_lang') as Language;
    if (saved === 'uz' || saved === 'ru' || saved === 'oz') {
      return saved;
    }
    return 'uz';
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('olx_currency') as Currency) || 'UZS';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('olx_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('olx_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('olx_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('olx_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const t = getTranslation(lang);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => subscribeToAuth(setCurrentUser), []);

  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [nearbyLocation, setNearbyLocation] = useState<{ latitude: number; longitude: number } | null>(() => {
    try {
      const raw = localStorage.getItem('oldisotti_user_location');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number' ? parsed : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncNearbyLocation = () => {
      try {
        const raw = localStorage.getItem('oldisotti_user_location');
        if (!raw) return setNearbyLocation(null);
        const parsed = JSON.parse(raw);
        if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') setNearbyLocation(parsed);
      } catch { /* ignore invalid cache */ }
    };
    window.addEventListener('oldisotti_user_location_updated', syncNearbyLocation);
    return () => window.removeEventListener('oldisotti_user_location_updated', syncNearbyLocation);
  }, []);

  // 2. Listings state
  const [listings, setListings] = useState<Listing[]>([]);
  useEffect(() => { localStorage.removeItem('olx_listings'); }, []);

  // 3. Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('olx_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('olx_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 3.5. Recently Viewed state (tracks last 5 unique listings clicked)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('olx_recently_viewed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      } catch (e) {
        console.error('Failed to parse saved recently viewed', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('olx_recently_viewed', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  // 4. Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => { localStorage.removeItem('olx_conversations'); }, []);

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  // 5. Filter state
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    categoryId: '',
    subcategoryId: '',
    region: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    onlyWithPhoto: false,
    onlyDelivery: false,
    onlyNegotiable: false,
    sortBy: 'newest'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 5.5 Loading state for listings feed and filter changes
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    setIsLoadingListings(true);
    const timer = setTimeout(() => {
      setIsLoadingListings(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [filters, currency]);

  // 6. Modals & Drawers state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMyAdsOpen, setIsMyAdsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoTabKey>('help');

  // 7. Admin Panel state & Platform Settings
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('olx_platform_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved platform settings', e);
      }
    }
    return initialPlatformSettings;
  });

  const [blockedSellerIds, setBlockedSellerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('olx_blocked_sellers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved blocked sellers', e);
      }
    }
    return [];
  });

  const [verifiedSellerIds, setVerifiedSellerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('olx_verified_sellers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved verified sellers', e);
      }
    }
    return ['seller-001', 'seller-003'];
  });

  useEffect(() => {
    localStorage.setItem('olx_blocked_sellers', JSON.stringify(blockedSellerIds));
  }, [blockedSellerIds]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('olx_blocked_sellers');
      if (saved) {
        try {
          setBlockedSellerIds(JSON.parse(saved));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('olx_blocked_sellers_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('olx_blocked_sellers_updated', handleStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('olx_verified_sellers', JSON.stringify(verifiedSellerIds));
  }, [verifiedSellerIds]);

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem('olx_moderation_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved moderation reports', e);
      }
    }
    return initialModerationReports;
  });

  useEffect(() => {
    localStorage.setItem('olx_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem('olx_moderation_reports', JSON.stringify(reports));
  }, [reports]);

  // Real-time Cloud Database (Firestore) synchronization
  useEffect(() => {
    let isMounted = true;

    // 1. Listings real-time listener
    const unsubscribeListings = subscribeToListings(
      async (dbListings) => {
        if (!isMounted) return;
        setIsDbConnected(true);
        setListings(dbListings);
      },
      (err) => {
        console.warn('Firestore subscription notice (using local offline cache):', err);
        setIsDbConnected(false);
      }
    );

    // 2. Conversations real-time listener
    const unsubscribeConversations = subscribeToConversations(
      async (dbConversations) => {
        if (!isMounted) return;
        setConversations(dbConversations);

      }
    );

    // 3. Platform Settings real-time listener
    const unsubscribeSettings = subscribeToPlatformSettings((dbSettings) => {
      if (!isMounted) return;
      setPlatformSettings(dbSettings);
      localStorage.setItem('olx_platform_settings', JSON.stringify(dbSettings));
    });

    // Moderation reports are admin-only and are subscribed in a separate auth-aware effect.
    const unsubscribeReports = () => {};

    return () => {
      isMounted = false;
      unsubscribeListings();
      unsubscribeConversations();
      unsubscribeSettings();
      unsubscribeReports();
    };
  }, []);

  // Admin-only moderation reports listener. Regular users never issue a forbidden Firestore read.
  useEffect(() => {
    if (!isAdminUser(currentUser)) {
      setReports([]);
      return;
    }
    return subscribeToModerationReports((dbReports) => {
      setReports(dbReports);
      localStorage.setItem('olx_moderation_reports', JSON.stringify(dbReports));
    });
  }, [currentUser]);

  const handleOpenInfoModal = (tab: InfoTabKey = 'help') => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  // Filter handlers
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      categoryId: '',
      subcategoryId: '',
      region: '',
      district: '',
      brand: undefined,
      minPrice: '',
      maxPrice: '',
      condition: 'all',
      onlyWithPhoto: false,
      onlyDelivery: false,
      onlyNegotiable: false,
      sortBy: 'newest'
    });
  };

  const handleResetToHome = () => {
    handleResetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [visibleLimit, setVisibleLimit] = useState(40);
  useEffect(() => setVisibleLimit(40), [filters]);

  // Filter & Sort listings logic
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Only active listings are visible in the public marketplace feed.
      if (item.status && item.status !== 'active') {
        return false;
      }

      // Hide listings from blocked sellers
      if (
        blockedSellerIds.includes(item.seller.id) ||
        (item.userId && blockedSellerIds.includes(item.userId))
      ) {
        return false;
      }

      // 1. Text Search query
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inSeller = item.seller.name.toLowerCase().includes(q);
        const inLocation =
          item.location.region.toLowerCase().includes(q) ||
          Boolean(item.location.district && item.location.district.toLowerCase().includes(q)) ||
          Boolean(item.location.address && item.location.address.toLowerCase().includes(q));

        let inAttributes = false;
        if (item.attributes) {
          inAttributes = Object.values(item.attributes).some((val) =>
            typeof val === 'string' && val.toLowerCase().includes(q)
          );
        }

        if (!inTitle && !inDesc && !inSeller && !inLocation && !inAttributes) {
          return false;
        }
      }

      // 2. Category
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }

      // 3. Subcategory
      if (filters.subcategoryId && item.subcategoryId !== filters.subcategoryId) {
        return false;
      }

      // 3.5. Brand filtering (strict & logical: checks brand property, title, and brand/model attributes)
      if (filters.brand) {
        const brandQuery = filters.brand.toLowerCase().trim();
        const hasDirectBrand = item.brand && item.brand.toLowerCase().includes(brandQuery);
        const hasTitleMatch = item.title.toLowerCase().includes(brandQuery);
        const hasAttributeMatch = item.attributes && Object.entries(item.attributes).some(
          ([key, val]) =>
            (key.toLowerCase().includes('brand') || key.toLowerCase().includes('model') || key.toLowerCase().includes('marka')) &&
            typeof val === 'string' &&
            val.toLowerCase().includes(brandQuery)
        );

        if (!hasDirectBrand && !hasTitleMatch && !hasAttributeMatch) {
          return false;
        }
      }

      // 4. Region & District
      if (filters.region && item.location.region !== filters.region) {
        return false;
      }
      if (filters.district && item.location.district !== filters.district) {
        return false;
      }

      // 5. Condition
      if (filters.condition !== 'all' && item.condition !== filters.condition) {
        return false;
      }

      // 6. Flags
      if (filters.onlyWithPhoto && item.images.length === 0) {
        return false;
      }
      if (filters.onlyDelivery && !item.isDeliveryAvailable) {
        return false;
      }
      if (filters.onlyNegotiable && !item.isNegotiable) {
        return false;
      }

      // 7. Price filtering (normalized to current view currency)
      const itemPriceInCurrent =
        item.currency === currency
          ? item.price
          : currency === 'USD'
          ? Math.round(item.price / USD_TO_UZS_RATE)
          : item.price * USD_TO_UZS_RATE;

      if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
        if (itemPriceInCurrent < Number(filters.minPrice)) {
          return false;
        }
      }
      if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
        if (itemPriceInCurrent > Number(filters.maxPrice)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'distance' && nearbyLocation) {
        const distanceKm = (item: Listing) => {
          const lat = item.location.latitude;
          const lon = item.location.longitude;
          if (typeof lat !== 'number' || typeof lon !== 'number') return Number.POSITIVE_INFINITY;
          const toRad = (deg: number) => deg * Math.PI / 180;
          const dLat = toRad(lat - nearbyLocation.latitude);
          const dLon = toRad(lon - nearbyLocation.longitude);
          const lat1 = toRad(nearbyLocation.latitude);
          const lat2 = toRad(lat);
          const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
          return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
        };
        return distanceKm(a) - distanceKm(b);
      }

      // Sorting
      if (filters.sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }

      const priceAInUzs = a.currency === 'USD' ? a.price * USD_TO_UZS_RATE : a.price;
      const priceBInUzs = b.currency === 'USD' ? b.price * USD_TO_UZS_RATE : b.price;

      if (filters.sortBy === 'price_asc') {
        return priceAInUzs - priceBInUzs;
      }
      if (filters.sortBy === 'price_desc') {
        return priceBInUzs - priceAInUzs;
      }

      // Default: 'newest' (VIP first, then order)
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      return 0;
    });
  }, [listings, filters, currency, blockedSellerIds, nearbyLocation]);

  // Add new listing handler
  const handleAddListing = async (newListing: Listing) => {
    const status = platformSettings.autoApproveListings ? 'active' : 'pending';
    newListing.status = status;
    const finalizedListing: Listing = {
      ...newListing,
      status
    };

    try {
      await saveListingToDb(finalizedListing);
      newListing.status = finalizedListing.status;
    } catch (e) {
      console.warn('Failed to save listing to Firestore:', e);
      throw e;
    }

    setListings((prev) => [finalizedListing, ...prev]);

    // Pending listings must never be published to Telegram before moderation.
    const shouldPostTelegram =
      finalizedListing.status === 'active' &&
      platformSettings.autoPostListingsToTelegram &&
      (!platformSettings.postOnlyVipToTelegram || finalizedListing.isVip || finalizedListing.isTop);

    if (shouldPostTelegram) {
      postListingToTelegram(finalizedListing, {
        channelId: platformSettings.telegramChannelId,
        botToken: platformSettings.telegramBotToken
      })
        .then(async (tgRes) => {
          if (tgRes.success) {
            const withTg: Listing = {
              ...finalizedListing,
              isPostedToTelegram: true,
              telegramMessageId: tgRes.messageId,
              telegramPostedAt: new Date().toISOString()
            };
            setListings((prev) =>
              prev.map((item) => (item.id === withTg.id ? withTg : item))
            );
            try {
              await saveListingToDb(withTg);
            } catch (err) {
              console.warn('Failed to update Telegram status in DB:', err);
            }
          }
        })
        .catch((tgErr) => {
          console.warn('Telegram auto-post error:', tgErr);
        });
    }
  };

  // Admin and Moderation handlers
  const handleUpdateListing = async (updated: Listing) => {
    setListings((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    if (selectedListing && selectedListing.id === updated.id) {
      setSelectedListing(updated);
    }
    try {
      await saveListingToDb(updated);
      if (updated.userId && (updated.status === 'active' || updated.status === 'rejected')) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'status',
          title: updated.status === 'active' ? "E'lon tasdiqlandi" : "E'lon rad etildi",
          message: updated.status === 'active'
            ? `"${updated.title}" e'loningiz muvaffaqiyatli moderatsiyadan o'tdi va e'lonlar ro'yxatiga chiqarildi.`
            : `"${updated.title}" e'loningiz rad etildi. Sababi: ${updated.rejectionReason || "Moderatsiya qoidalariga to'g'ri kelmadi"}`,
          createdAt: new Date().toISOString(),
          read: false,
          recipientId: updated.userId,
          listingId: updated.id
        };
        await saveNotificationToDb(notif).catch((err) => console.warn('Could not save notification:', err));
      }
    } catch (e) {
      console.warn('Failed to update listing in Firestore:', e);
      throw e;
    }
  };

  const handleResetCatalogDefaults = async () => {
    setListings(mockListings);
    localStorage.setItem('olx_listings', JSON.stringify(mockListings));
    try {
      await seedInitialListingsIfEmpty(mockListings);
      for (const item of mockListings) {
        await saveListingToDb(item);
      }
    } catch (e) {
      console.warn('Failed to reset catalog in Firestore:', e);
      throw e;
    }
  };

  const handleToggleBlockSeller = async (sellerId: string) => {
    const isCurrentlyBlocked = blockedSellerIds.includes(sellerId);
    setBlockedSellerIds((prev) =>
      isCurrentlyBlocked ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]
    );
    try {
      if (isCurrentlyBlocked) {
        await unblockSellerInDb(sellerId);
      } else {
        await blockSellerInDb(sellerId);
      }
    } catch (e) {
      console.warn('Failed to sync blocked seller with Firestore:', e);
    }
  };

  const handleToggleVerifySeller = async (sellerId: string) => {
    if (!isAdminUser(currentUser)) return;
    const affected = listings.filter((l) => l.seller.id === sellerId || l.userId === sellerId);
    const currentlyVerified = affected.some((l) => l.seller.isVerified) || verifiedSellerIds.includes(sellerId);
    const newVerified = !currentlyVerified;

    try {
      for (const listing of affected) {
        await updateListingInDb(listing.id, {
          seller: { ...listing.seller, isVerified: newVerified }
        });
      }
      setVerifiedSellerIds((prev) =>
        newVerified ? Array.from(new Set([...prev, sellerId])) : prev.filter((id) => id !== sellerId)
      );
      setListings((prev) =>
        prev.map((l) =>
          l.seller.id === sellerId || l.userId === sellerId
            ? { ...l, seller: { ...l.seller, isVerified: newVerified } }
            : l
        )
      );
    } catch (e) {
      console.warn('Failed to persist seller verification:', e);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    try {
      await updateReportStatusInDb(reportId, status);
    } catch (e) {
      console.warn('Failed to update report status in Firestore:', e);
    }
  };

  // Mark as sold handler
  const handleMarkAsSold = async (id: string) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'sold' as const } : item))
    );
    try {
      await updateListingInDb(id, { status: 'sold' });
    } catch (e) {
      console.warn('Failed to mark sold in Firestore:', e);
    }
  };

  // Delete listing handler
  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListingFromDb(id);
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      window.alert('E’lonni o‘chirib bo‘lmadi. Qayta urinib ko‘ring.');
    }
  };

  // VIP is never granted directly from the browser.
  const handleUpgradeToVip = async (_id: string) => {
    window.alert("VIP faqat tasdiqlangan to'lovdan keyin faollashtiriladi.");
  };

  // Start chat for listing
  const handleStartChat = async (listing: Listing) => {
    if (!currentUser || currentUser.isAnonymous) {
      window.alert('Chatdan foydalanish uchun avval akkauntingizga kiring.');
      return;
    }
    if (listing.userId === currentUser.uid) {
      window.alert("O'zingizning e'loningiz bilan chat ochib bo'lmaydi.");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('listing');
    window.history.replaceState({}, '', url);
    setSelectedListing(null);

    // Check if conversation already exists
    const existing = conversations.find((c) => c.listingId === listing.id);
    if (existing) {
      setActiveChatId(existing.id);
      setIsChatOpen(true);
      return;
    }

    // Create new conversation
    const newConv: Conversation = {
      id: `chat-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingCurrency: listing.currency,
      listingImage: listing.images[0] || '',
      sellerId: listing.seller.id,
      sellerName: listing.seller.name,
      sellerAvatar:
        listing.seller.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      sellerPhone: listing.seller.phone,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'buyer',
          text: `Assalomu alaykum, "${listing.title}" bo'yicha yozmoqdaman.`,
          timestamp: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString(),
      unreadCount: 0
    };

    try {
      await saveConversationToDb(newConv);
      setActiveChatId(newConv.id);
      setIsChatOpen(true);
    } catch (e) {
      window.alert('Suhbat ochilmadi. Qayta urinib ko‘ring.');
    }
  };

  // Send message in chat
  const handleSendMessage = async (chatId: string, text: string) => {
    const sendingConversation = conversations.find((c) => c.id === chatId);
    const senderRole: ChatMessage['sender'] = sendingConversation?.sellerUserId === currentUser?.uid ? 'seller' : 'buyer';
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: senderRole,
      text,
      timestamp: new Date().toISOString()
    };

    await appendMessageInDb(chatId, newMessage);
  };

  // Full manual database resync handler
  const handleResyncWithFirestore = async () => {
    try {
      await seedInitialListingsIfEmpty(mockListings);
      for (const item of mockListings) {
        await saveListingToDb(item);
      }
      for (const conv of mockConversations) {
        await saveConversationToDb(conv);
      }
      await savePlatformSettingsToDb(initialPlatformSettings);
      setIsDbConnected(true);
    } catch (e) {
      console.error('Failed to resync database:', e);
    }
  };

  // Listings for favorites drawer
  const favoriteListings = useMemo(() => {
    return listings.filter((l) => favorites.includes(l.id));
  }, [listings, favorites]);

  // User's own listings are strictly bound to the authenticated Firebase UID.
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((l) => l.userId === currentUser.uid);
  }, [listings, currentUser]);

  // Computed recently viewed listings list (strictly up to 5 items)
  const recentlyViewedListings = useMemo(() => {
    return recentlyViewedIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is Listing => l !== undefined);
  }, [recentlyViewedIds, listings]);

  // Deep links fetch one document independently of the loaded feed.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('listing');
    if (!id || selectedListing?.id === id) return;
    let active = true;
    void fetchListingById(id).then(listing => {
      if (active && listing?.status === 'active') setSelectedListing(listing);
    }).catch(() => {});
    return () => { active = false; };
  }, [selectedListing?.id]);

  // Centralized selection handler that tracks recently viewed listings
  const handleSelectListing = (listing: Listing) => {
    const url = new URL(window.location.href);
    url.searchParams.set('listing', listing.id);
    window.history.replaceState({}, '', url);
    setSelectedListing(listing);
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== listing.id);
      return [listing.id, ...filtered].slice(0, 5);
    });
    // Record view in Firestore asynchronously
    incrementListingViewsInDb(listing.id);
  };

  const handleClearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem('olx_recently_viewed');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 w-full max-w-full overflow-x-hidden pb-20 sm:pb-24 transition-colors duration-200 smooth-scroll">

      {/* Maintenance Mode Notice (Admin Controlled) */}
      {platformSettings.maintenanceMode && (
        <div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs z-40">
          <div className="flex items-center gap-2 mx-auto">
            <AlertTriangle size={15} />
            <span>DIQQAT: Tizimda texnik profilaktika rejimi yoqilgan.</span>
          </div>
          {isAdminUser(currentUser) && (
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="underline hover:text-rose-100 text-xs font-black cursor-pointer mr-2"
            >
              Admin
            </button>
          )}
        </div>
      )}

      {/* 1. Oldisotti Sticky Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        currency={currency}
        onCurrencyChange={setCurrency}
        unreadCount={unreadMessagesCount}
        favoritesCount={favorites.length}
        onOpenChat={() => {
          setActiveChatId(conversations[0]?.id || null);
          setIsChatOpen(true);
        }}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenMyAds={() => setIsMyAdsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onResetToHome={handleResetToHome}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        selectedCategoryId={filters.categoryId}
        onSelectCategory={(catId) => {
          handleFilterChange({ categoryId: catId, subcategoryId: '' });
          if (catId) {
            document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        isDbConnected={isDbConnected}
      />

      {/* 2. Main Search & Location Banner */}
      <SearchBanner
        lang={lang}
        searchQuery={filters.query}
        onSearchChange={(q) => handleFilterChange({ query: q })}
        selectedRegion={filters.region}
        onLocationChange={(r) => handleFilterChange({ region: r, district: '' })}
        onSearchSubmit={() => {
          // Scroll smoothly to results
          document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. Categories Bar */}
      <CategoriesBar
        lang={lang}
        selectedCategoryId={filters.categoryId}
        selectedSubcategoryId={filters.subcategoryId}
        onSelectCategory={(catId) => {
          handleFilterChange({ categoryId: catId });
          if (catId) {
            document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onSelectSubcategory={(subId) => {
          handleFilterChange({ subcategoryId: subId });
          if (subId) {
            document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 3.5. Popular Brands Bar */}
      <PopularBrandsBar
        selectedBrand={filters.brand}
        onSelectBrand={(brandName) => {
          handleFilterChange({ brand: brandName });
          document.getElementById('listings-feed-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* 4. Main Feed Section */}
      <main className="flex-1 mx-auto max-w-7xl w-full max-w-full px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
        <div id="listings-feed-anchor"></div>

        {/* VIP / TOP Promoted Carousel (only if no restrictive search is applied) */}
        {!filters.query && !filters.categoryId && (
          <VipListings
            listings={listings}
            currency={currency}
            lang={lang}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectListing={handleSelectListing}
            blockedSellerIds={blockedSellerIds}
          />
        )}

        {/* Filter bar & Sorting */}
        <ListingFilters
          lang={lang}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalCount={filteredListings.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {filteredListings.length > visibleLimit && <button type="button" onClick={() => setVisibleLimit(n => n + 40)} className="my-3 rounded-xl bg-indigo-600 px-5 py-3 text-white">Yana 40 ta e’lonni ko‘rsatish</button>}
        {/* Listings Grid / List / Skeleton */}
        {isLoadingListings ? (
          <ListingSkeletonGrid count={viewMode === 'grid' ? 10 : 5} viewMode={viewMode} />
        ) : filteredListings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.nothingFound}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.tryChangeFilters}</p>
            <button
              onClick={handleResetFilters}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-in fade-in duration-200">
            {filteredListings.slice(0, visibleLimit).map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                currency={currency}
                lang={lang}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={handleSelectListing}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-200">
            {filteredListings.slice(0, visibleLimit).map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                currency={currency}
                lang={lang}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={handleSelectListing}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {/* Recently Viewed Strip below main feed */}
        <RecentlyViewed
          listings={recentlyViewedListings}
          currency={currency}
          lang={lang}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectListing={handleSelectListing}
          onClearHistory={handleClearRecentlyViewed}
        />
      </main>

      {/* 5. Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('listing');
            window.history.replaceState({}, '', url);
            setSelectedListing(null);
          }}
          currency={currency}
          lang={lang}
          isFavorite={favorites.includes(selectedListing.id)}
          onToggleFavorite={handleToggleFavorite}
          onStartChat={handleStartChat}
          onSelectListing={handleSelectListing}
          allListings={listings}
          favorites={favorites}
          onOpenInfoModal={handleOpenInfoModal}
        />
      )}

      {/* 6. Post Ad Modal */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        lang={lang}
        onAddListing={handleAddListing}
        onOpenInfoModal={handleOpenInfoModal}
      />

      {/* 7. Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        lang={lang}
        currency={currency}
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onSendMessage={handleSendMessage}
      />

      {/* 8. Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        lang={lang}
        currency={currency}
        favoriteListings={favoriteListings}
        onRemoveFavorite={handleToggleFavorite}
        onSelectListing={handleSelectListing}
      />

      {/* 9. My Ads Modal */}
      <MyAdsModal
        isOpen={isMyAdsOpen}
        onClose={() => setIsMyAdsOpen(false)}
        lang={lang}
        currency={currency}
        myListings={myListings}
        onMarkAsSold={handleMarkAsSold}
        onDeleteListing={handleDeleteListing}
        onUpgradeToVip={handleUpgradeToVip}
        onSelectListing={handleSelectListing}
        onOpenPostAd={() => {
          setIsMyAdsOpen(false);
          setIsPostAdOpen(true);
        }}
      />

      {/* 9.5. Safe Shopping & Fast Delivery Highlight Section with Skeleton Loading State */}
      <SafePurchasesSection
        lang={lang}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onExplore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenInfoModal={handleOpenInfoModal}
      />

      {/* 9.8. Frequently Asked Questions Section */}
      <FaqSection lang={lang} />

      {/* 9.9. Institutional Info, Rules, VIP & Policies Modal */}
      <InfoPagesModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        initialTab={infoModalTab}
        lang={lang}
        onOpenPostAd={() => {
          setIsInfoModalOpen(false);
          setIsPostAdOpen(true);
        }}
      />

      {/* 9.95. Admin Management & Moderation Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lang={lang}
        currency={currency}
        listings={listings}
        onUpdateListing={handleUpdateListing}
        onDeleteListing={handleDeleteListing}
        onSelectListing={handleSelectListing}
        onResetCatalogDefaults={handleResetCatalogDefaults}
        platformSettings={platformSettings}
        onUpdatePlatformSettings={async (settings) => {
          setPlatformSettings(settings);
          try {
            await savePlatformSettingsToDb(settings);
          } catch (e) {
            console.warn('Failed to save settings to Firestore:', e);
            throw e;
          }
        }}
        blockedSellerIds={blockedSellerIds}
        onToggleBlockSeller={handleToggleBlockSeller}
        verifiedSellerIds={verifiedSellerIds}
        onToggleVerifySeller={handleToggleVerifySeller}
        reports={reports}
        onUpdateReportStatus={handleUpdateReportStatus}
        isDbConnected={isDbConnected}
        onResyncDb={handleResyncWithFirestore}
      />

      {/* 10. Footer */}
      <Footer
        lang={lang}
        onOpenInfoModal={handleOpenInfoModal}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 11. Smooth Scroll To Top Button */}
      <ScrollToTop />

      {/* 12. Bottom Navigation Bar with Center Post Ad button */}
      <BottomNav
        lang={lang}
        unreadCount={unreadMessagesCount}
        favoritesCount={favorites.length}
        onHomeClick={handleResetToHome}
        onMessagesClick={() => {
          setActiveChatId(conversations[0]?.id || null);
          setIsChatOpen(true);
        }}
        onPostAdClick={() => setIsPostAdOpen(true)}
        onFavoritesClick={() => setIsFavoritesOpen(true)}
        onMyAdsClick={() => setIsMyAdsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
