export type Language = 'uz' | 'ru' | 'oz';
export type Currency = 'UZS' | 'USD';
export type Condition = 'all' | 'new' | 'used';
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export interface LocationInfo {
  region: string;
  district: string;
  address?: string;
}

export interface SellerInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  telegram?: string;
  registeredSince: string;
  responseTime: string;
  isVerified: boolean;
  rating: number;
  activeAdsCount: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  currency: Currency;
  isNegotiable: boolean;
  condition: 'new' | 'used';
  location: LocationInfo;
  images: string[];
  createdAt: string;
  viewsCount: number;
  isTop: boolean;
  isVip: boolean;
  seller: SellerInfo;
  attributes?: Record<string, string>;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  rejectionReason?: string;
  isDeliveryAvailable: boolean;
  deliveryNote?: string;
  brand?: string;
  isPostedToTelegram?: boolean;
  telegramMessageId?: number;
  telegramPostedAt?: string;
}

export interface SubCategory {
  id: string;
  name: {
    uz: string;
    ru: string;
    oz: string;
  };
  iconName?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: {
    uz: string;
    ru: string;
    oz: string;
  };
  iconName: string;
  iconBg: string;
  subcategories: SubCategory[];
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: Currency;
  listingImage: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerPhone: string;
  messages: ChatMessage[];
  lastUpdated: string;
  unreadCount: number;
}

export interface FilterState {
  query: string;
  categoryId: string;
  subcategoryId: string;
  region: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  condition: Condition;
  onlyWithPhoto: boolean;
  onlyDelivery: boolean;
  onlyNegotiable: boolean;
  sortBy: SortOption;
  brand?: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  autoApproveListings: boolean;
  vipPricePerDay: number;
  announcementText: string;
  isAnnouncementActive: boolean;
  // Telegram Integration
  telegramBotToken?: string;
  telegramChannelId?: string;
  telegramBotUsername?: string;
  autoPostListingsToTelegram?: boolean;
  postOnlyVipToTelegram?: boolean;
  notifySellerOnChat?: boolean;
}

export interface ModerationReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: 'spam' | 'price' | 'prohibited' | 'fraud' | 'other';
  reporterPhone?: string;
  comment?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
