import { PlatformSettings, ModerationReport, Listing } from '../types';

export const initialPlatformSettings: PlatformSettings = {
  maintenanceMode: false,
  autoApproveListings: false,
  vipPricePerDay: 25000,
  announcementText: "🎉 OldiSotdi yangilandi! Endi barcha viloyatlar bo'yicha xavfsiz oldi-sotdi va qulay qidiruv tizimi ishlamoqda.",
  isAnnouncementActive: true,
  telegramChannelId: '@OSot_uz',
  telegramBotUsername: 'OSotBot',
  autoPostListingsToTelegram: true,
  postOnlyVipToTelegram: false,
  notifySellerOnChat: true
};

export const initialModerationReports: ModerationReport[] = [
  {
    id: 'rep-001',
    listingId: 'olx-003',
    listingTitle: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
    reason: 'price',
    reporterPhone: '+998 90 123 45 67',
    comment: 'Bozor narxidan ancha past, tekshirib ko\'rish kerak.',
    createdAt: '2 soat oldin',
    status: 'pending'
  },
  {
    id: 'rep-002',
    listingId: 'olx-006',
    listingTitle: 'Yangi uslubdagi divan va 2 ta kreslo to\'plami',
    reason: 'spam',
    reporterPhone: '+998 97 888 99 00',
    comment: 'Bir xil rasm boshqa viloyatda ham qo\'yilgan edi.',
    createdAt: '1 kun oldin',
    status: 'pending'
  }
];

export interface AdminSellerSummary {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  telegram?: string;
  registeredSince: string;
  isVerified: boolean;
  rating: number;
  listingsCount: number;
  activeCount: number;
  totalViews: number;
  isBlocked?: boolean;
}

export function extractSellersFromListings(listings: Listing[], blockedSellerIds: string[] = [], verifiedSellerIds: string[] = []): AdminSellerSummary[] {
  const sellerMap = new Map<string, AdminSellerSummary>();

  for (const item of listings) {
    const s = item.seller;
    const existing = sellerMap.get(s.id);
    const isVerified = verifiedSellerIds.includes(s.id) || s.isVerified;
    const isBlocked = blockedSellerIds.includes(s.id);

    if (existing) {
      existing.listingsCount += 1;
      if (item.status === 'active') existing.activeCount += 1;
      existing.totalViews += item.viewsCount;
    } else {
      sellerMap.set(s.id, {
        id: s.id,
        name: s.name,
        phone: s.phone,
        avatar: s.avatar,
        telegram: s.telegram,
        registeredSince: s.registeredSince,
        isVerified,
        rating: s.rating,
        listingsCount: 1,
        activeCount: item.status === 'active' ? 1 : 0,
        totalViews: item.viewsCount,
        isBlocked
      });
    }
  }

  return Array.from(sellerMap.values()).sort((a, b) => b.listingsCount - a.listingsCount);
}
