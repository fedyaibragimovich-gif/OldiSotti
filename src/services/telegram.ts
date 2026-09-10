import { Listing, Currency } from '../types';

export interface TelegramPostResponse {
  success: boolean;
  messageId?: number;
  simulated?: boolean;
  channel?: string;
  error?: string;
  formattedCaption?: string;
  telegramPostUrl?: string;
}

export interface TelegramConnectionResponse {
  success: boolean;
  configured?: boolean;
  simulated?: boolean;
  bot?: { id: number; first_name: string; username?: string; can_join_groups?: boolean; can_read_all_group_messages?: boolean };
  channel?: { id: number | string; title?: string; username?: string; type?: string };
  links?: { bot?: string; channel?: string };
  error?: string;
  message?: string;
}

function formatPriceText(price: number, currency: Currency): string {
  const formatted = price.toLocaleString('uz-UZ');
  return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
}

export function formatTelegramPostPreview(listing: Listing, appUrl?: string): string {
  const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://oldisotti.uz');
  const listingUrl = `${baseUrl}/?listing=${listing.id}`;
  const price = formatPriceText(listing.price, listing.currency);
  const location = `${listing.location.region}${listing.location.district ? `, ${listing.location.district}` : ''}`;
  const condition = listing.condition === 'new' ? '✨ Yangi' : '🔄 Ishlatilgan';
  const vipBadge = listing.isVip ? ' ⭐ [VIP E\'lon]' : '';
  const shortDesc = listing.description.length > 220 ? `${listing.description.slice(0, 220)}...` : listing.description;

  return [
    `📢 <b>${listing.title.toUpperCase()}</b>${vipBadge}`,
    ``,
    `💰 <b>Narxi:</b> ${price} ${listing.isNegotiable ? '(kelishiladi)' : ''}`,
    `📍 <b>Manzil:</b> ${location}`,
    `🏷️ <b>Holati:</b> ${condition}`,
    listing.isDeliveryAvailable ? `🚚 <b>Yetkazib berish:</b> Sotuvchi o'zi yetkazadi` : `📦 <b>Olib ketish:</b> Olib ketiladi`,
    ``,
    `📝 <b>Tavsif:</b>`,
    `<i>${shortDesc}</i>`,
    ``,
    `👤 <b>Sotuvchi:</b> ${listing.seller.name}`,
    `📞 <b>Aloqa:</b> ${listing.seller.phone}`,
    listing.seller.telegram ? `✈️ <b>Telegram:</b> ${listing.seller.telegram}` : '',
    ``,
    `🔗 <b>Batafsil ko'rish:</b> ${listingUrl}`,
    ``,
    `#${listing.location.region.replace(/['`\s]/g, '')} #OldiSotti #Elonlar`
  ].filter(Boolean).join('\n');
}

export function createTelegramShareUrl(listing: Listing, appUrl?: string): string {
  const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://oldisotti.uz');
  const url = `${baseUrl}/?listing=${listing.id}`;
  const price = formatPriceText(listing.price, listing.currency);
  const text = `📢 ${listing.title} — ${price}\n📍 ${listing.location.region}\nOldisotti platformasida batafsil ko'ring:`;
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** Publish an active listing through the secure Vercel endpoint. */
export async function postListingToTelegram(listing: Listing, options?: { appUrl?: string }): Promise<TelegramPostResponse> {
  try {
    const baseUrl = options?.appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const listingUrl = `${baseUrl}/?listing=${encodeURIComponent(listing.id)}`;
    const res = await fetch('/api/telegram/post-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: listing.title,
        price: formatPriceText(listing.price, listing.currency) + (listing.isNegotiable ? ' (kelishiladi)' : ''),
        url: listingUrl,
        imageUrl: listing.images?.[0] || '',
        description: listing.description,
        location: `${listing.location.region}${listing.location.district ? `, ${listing.location.district}` : ''}`,
        category: listing.brand ? `${listing.categoryId} • ${listing.brand}` : listing.categoryId
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, channel: data.channel, error: data.error || `Telegram server javobi: ${res.status}` };
    }
    return data as TelegramPostResponse;
  } catch (err: any) {
    console.warn('Telegram post API request failed:', err);
    return { success: false, error: err?.message || 'Telegram serveriga ulanib bo\'lmadi' };
  }
}

export async function testTelegramConnection(): Promise<TelegramConnectionResponse> {
  try {
    const res = await fetch('/api/telegram/test-connection', { method: 'GET' });
    return (await res.json().catch(() => ({}))) as TelegramConnectionResponse;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Telegram serveriga ulanib bo\'lmadi' };
  }
}

export async function notifySellerOnTelegram(params: { sellerTelegram?: string; listingTitle: string; buyerName: string; messageText: string; listingId: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params)
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('Telegram seller notification error:', err);
    return false;
  }
}

export interface TelegramNotificationParams { type?: string; title: string; message: string; listingId?: string; chatId?: string; sellerTelegram?: string; }

export async function sendTelegramNotification(params: TelegramNotificationParams): Promise<boolean> {
  return notifySellerOnTelegram({ sellerTelegram: params.sellerTelegram || params.chatId, listingTitle: params.title, buyerName: 'Foydalanuvchi', messageText: params.message, listingId: params.listingId || '' });
}
