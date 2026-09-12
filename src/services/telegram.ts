import { Listing } from '../types';

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

export function formatTelegramPostPreview(listing: Listing, appUrl?: string): string {
  const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://oldisotti.uz');
  return `<a href="${baseUrl}/?listing=${encodeURIComponent(listing.id)}">OldiSotti'da e'lonni ko'rish</a>`;
}

export function createTelegramShareUrl(listing: Listing, appUrl?: string): string {
  const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://oldisotti.uz');
  const url = `${baseUrl}/?listing=${listing.id}`;
  return `https://t.me/share/url?url=${encodeURIComponent(url)}`;
}

/** Bot credentials are never accepted from the browser. */
export async function postListingToTelegram(
  listing: Listing,
  options?: { appUrl?: string; channelId?: string; botToken?: string }
): Promise<TelegramPostResponse> {
  try {
    const baseUrl = options?.appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://oldisotti.uz');
    const res = await fetch('/api/telegram/post-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing, appUrl: baseUrl, channelId: options?.channelId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, channel: data.channel, error: data.error || `Telegram server javobi: ${res.status}` };
    }
    return { ...data, telegramPostUrl: data.messageId ? `${options?.channelId || '@OSot_uz'}/${data.messageId}` : undefined } as TelegramPostResponse;
  } catch (err: any) {
    console.warn('Telegram post API request failed:', err);
    return { success: false, error: err?.message || 'Telegram serveriga ulanib bo\'lmadi' };
  }
}

export async function testTelegramConnection(_botToken?: string, channelId?: string): Promise<TelegramConnectionResponse> {
  try {
    const res = await fetch('/api/telegram/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    });
    return (await res.json().catch(() => ({}))) as TelegramConnectionResponse;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Telegram serveriga ulanib bo\'lmadi' };
  }
}

export async function notifySellerOnTelegram(params: { sellerTelegram?: string; listingTitle: string; buyerName: string; messageText: string; listingId: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
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
