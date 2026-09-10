import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  Language,
  Currency,
  FilterState,
  Conversation,
  ChatMessage,
  PlatformSettings,
  ModerationReport
} from './types';
import { mockListings, mockConversations } from './data/mockListings';
import { USD_TO_UZS_RATE } from './utils/formatters';
import { getTranslation } from './data/translations';
import { initialPlatformSettings, initialModerationReports } from './data/adminData';
import { AlertTriangle } from 'lucide-react';
import {
  subscribeToListings,
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
  updateReportStatusInDb
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

  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // 2. Listings state
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('olx_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved listings', e);
      }
    }
    return mockListings;
  });

  useEffect(() => {
    localStorage.setItem('olx_listings', JSON.stringify(listings));
  }, [listings]);

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
    return ['olx-001', 'olx-002'];
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
    return ['olx-001', 'olx-002', 'olx-004'];
  });

  useEffect(() => {
    localStorage.setItem('olx_recently_viewed', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  // 4. Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('olx_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved conversations', e);
      }
    }
    return mockConversations;
  });

  useEffect(() => {
    localStorage.setItem('olx_conversations', JSON.stringify(conversations));
  }, [conversations]);

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
