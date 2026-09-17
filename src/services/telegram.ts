import { Listing } from '../types';
import { auth } from '../lib/firebase';
import { toPublicListingId } from '../lib/publicListingId';

const FALLBACK_PUBLIC_ORIGIN = 'https://oldi-sotdi.uz';

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

async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

async function readJsonResponse<T extends Record<string, any>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function normalizeAppOrigin(appUrl?: string): string {
  const origin = appUrl || (typeof window !== 'undefined' ? window.location.origin : FALLBACK_PUBLIC_ORIGIN);
  return origin.replace(/\/$/, '');
}

function listingPublicUrl(listing: Listing, appUrl?: string): string {
  return `${normalizeAppOrigin(appUrl)}/l/${encodeURIComponent(toPublicListingId(listing.id))}`;
}

/**
 * Telegram only needs a small public subset of a listing. Do not send the full
 * listing object because legacy/base64 image values can make the request too
 * large for the edge before the serverless function is reached.
 */
function buildTelegramListingPayload(listing: Listing) {
  const firstRemoteImage = Array.isArray(listing.images)
    ? listing.images.find((image) => /^https?:\/\//i.test(String(image || '').trim()))
    : undefined;

  return {
    id: listing.id,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency,
    location: listing.location
      ? {
          region: listing.location.region,
          district: listing.location.district
        }
      : undefined,
    condition: listing.condition,
    isDeliveryAvailable: listing.isDeliveryAvailable,
    isNegotiable: listing.isNegotiable,
    images: firstRemoteImage ? [firstRemoteImage] : []
  };
}

function networkErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "OldiSotdi Telegram API'ga ulanib bo‘lmadi. Sahifani yangilang va qayta urinib ko‘ring.";
  }
  return message || "Telegram serveriga ulanib bo‘lmadi";
}

export function formatTelegramPostPreview(listing: Listing, appUrl?: string): string {
  return `<a href="${listingPublicUrl(listing, appUrl)}">OldiSotdi'da e'lonni ko'rish</a>`;
}

export function createTelegramShareUrl(listing: Listing, appUrl?: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(listingPublicUrl(listing, appUrl))}`;
}

/** Bot credentials are never accepted from the browser. */
export async function postListingToTelegram(
  listing: Listing,
  options?: { appUrl?: string; channelId?: string; botToken?: string }
): Promise<TelegramPostResponse> {
  let headers: Record<string, string> | null;
  try {
    headers = await getAuthHeaders();
  } catch (error) {
    console.warn('Telegram auth token request failed:', error);
    return { success: false, error: 'Sessiya tokenini olishda xato. Akkauntdan chiqib, qayta kiring.' };
  }

  if (!headers) return { success: false, error: 'Telegramga yuborish uchun akkauntga kiring.' };

  try {
    const baseUrl = normalizeAppOrigin(options?.appUrl);
    const res = await fetch('/api/telegram/post-listing', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        listing: buildTelegramListingPayload(listing),
        appUrl: baseUrl,
        channelId: options?.channelId
      })
    });
    const data = await readJsonResponse<any>(res);
    if (!res.ok || !data.success) {
      return { success: false, channel: data.channel, error: data.error || `Telegram server javobi: HTTP ${res.status}` };
    }
    return { ...data, telegramPostUrl: data.messageId ? `${options?.channelId || '@OSot_uz'}/${data.messageId}` : undefined } as TelegramPostResponse;
  } catch (error) {
    console.warn('Telegram post API request failed:', error);
    return { success: false, error: networkErrorMessage(error) };
  }
}

export async function testTelegramConnection(_botToken?: string, channelId?: string): Promise<TelegramConnectionResponse> {
  let headers: Record<string, string> | null;
  try {
    headers = await getAuthHeaders();
  } catch (error) {
    console.warn('Telegram connection auth token request failed:', error);
    return { success: false, error: 'Sessiya tokenini olishda xato. Akkauntdan chiqib, qayta kiring.' };
  }

  if (!headers) return { success: false, error: 'Telegram sozlamalarini tekshirish uchun akkauntga kiring.' };

  try {
    const res = await fetch('/api/telegram/test-connection', {
      method: 'POST',
      headers,
      body: JSON.stringify({ channelId })
    });
    const data = await readJsonResponse<TelegramConnectionResponse>(res);
    if (!res.ok || !data.success) {
      return {
        ...data,
        success: false,
        error: data.error || `Telegram ulanishini tekshirishda server xatosi: HTTP ${res.status}`
      };
    }
    return data;
  } catch (error) {
    return { success: false, error: networkErrorMessage(error) };
  }
}

export async function notifySellerOnTelegram(params: { sellerTelegram?: string; listingTitle: string; buyerName: string; messageText: string; listingId: string }): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return false;
    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    });
    const data = await readJsonResponse<any>(res);
    return Boolean(res.ok && data.success);
  } catch (err) {
    console.warn('Telegram seller notification error:', err);
    return false;
  }
}

export interface TelegramNotificationParams { type?: string; title: string; message: string; listingId?: string; chatId?: string; sellerTelegram?: string; }

export async function sendTelegramNotification(params: TelegramNotificationParams): Promise<boolean> {
  return notifySellerOnTelegram({ sellerTelegram: params.sellerTelegram || params.chatId, listingTitle: params.title, buyerName: 'Foydalanuvchi', messageText: params.message, listingId: params.listingId || '' });
}
