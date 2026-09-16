import { isVerifiedAdmin, verifyFirebaseUser } from '../_shared.js';

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

type TelegramResult = {
  ok?: boolean;
  result?: { message_id?: number };
  description?: string;
};

const FALLBACK_PUBLIC_ORIGIN = 'https://fedyaibragimovich-gif.vercel.app';
const LEGACY_OLX_ID = /^olx-(.+)$/i;
const LEGACY_DEMO_ID = /^olx-(\d+)$/i;

function toPublicListingId(id: string): string {
  const normalized = String(id || '').trim();
  const demoMatch = LEGACY_DEMO_ID.exec(normalized);
  if (demoMatch) return `oldisotdi-demo-${demoMatch[1]}`;
  const legacyMatch = LEGACY_OLX_ID.exec(normalized);
  return legacyMatch ? `oldisotdi-listing-${legacyMatch[1]}` : normalized;
}

function normalizePublicOrigin(value: unknown): string {
  const candidate = String(value || '').trim() || FALLBACK_PUBLIC_ORIGIN;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return FALLBACK_PUBLIC_ORIGIN;
    return parsed.origin;
  } catch {
    return FALLBACK_PUBLIC_ORIGIN;
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(price: unknown, currency: unknown): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return 'Narx ko\'rsatilmagan';
  const formatted = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount);
  return String(currency) === 'USD' ? `$${formatted}` : `${formatted} so'm`;
}

function buildCaption(listing: Record<string, any>, url: string): string {
  const title = escapeHtml(String(listing.title || 'E\'lon').slice(0, 120));
  const price = escapeHtml(formatPrice(listing.price, listing.currency));
  const region = escapeHtml(String(listing.location?.region || '').slice(0, 80));
  const district = escapeHtml(String(listing.location?.district || '').slice(0, 80));
  const place = [region, district].filter(Boolean).join(', ');
  const description = escapeHtml(
    String(listing.description || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 320)
  );
  const condition = listing.condition === 'new' ? 'Yangi' : listing.condition === 'used' ? 'Ishlatilgan' : '';
  const delivery = listing.isDeliveryAvailable ? ' • 🚚 Yetkazib berish bor' : '';
  const negotiable = listing.isNegotiable ? ' • Kelishiladi' : '';

  const lines = [
    `🛍 <b>${title}</b>`,
    '',
    `💰 <b>${price}</b>${negotiable}`,
    place ? `📍 ${place}` : '',
    condition ? `📦 ${condition}${delivery}` : delivery ? `🚚 Yetkazib berish bor` : '',
    description ? `\n${description}${String(listing.description || '').length > 320 ? '…' : ''}` : '',
    '',
    `🔎 <a href="${escapeHtml(url)}">OldiSotdi'da e'lonni ko'rish</a>`
  ].filter((line) => line !== '');

  return lines.join('\n').slice(0, 1000);
}

function getReplyMarkup(url: string) {
  return {
    inline_keyboard: [[{ text: "🔎 E'lonni ko'rish", url }]]
  };
}

async function sendPhotoCard(
  token: string,
  channelId: string,
  image: string,
  caption: string,
  url: string
): Promise<{ response: Response; data: TelegramResult } | null> {
  if (/^https?:\/\//i.test(image)) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        photo: image,
        caption,
        parse_mode: 'HTML',
        reply_markup: getReplyMarkup(url)
      })
    });
    const data = (await response.json().catch(() => ({}))) as TelegramResult;
    return { response, data };
  }

  const dataMatch = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
  if (dataMatch) {
    const mimeType = dataMatch[1];
    const bytes = Buffer.from(dataMatch[2], 'base64');
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const form = new FormData();
    form.append('chat_id', channelId);
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    form.append('reply_markup', JSON.stringify(getReplyMarkup(url)));
    form.append('photo', new Blob([bytes], { type: mimeType }), `listing.${extension}`);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form
    });
    const data = (await response.json().catch(() => ({}))) as TelegramResult;
    return { response, data };
  }

  return null;
}

async function sendTextCard(
  token: string,
  channelId: string,
  caption: string,
  url: string
): Promise<{ response: Response; data: TelegramResult }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      text: caption,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: getReplyMarkup(url)
    })
  });
  const data = (await response.json().catch(() => ({}))) as TelegramResult;
  return { response, data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const currentUser = await verifyFirebaseUser(req);
  if (!currentUser) return res.status(401).json({ success: false, error: 'Authentication required' });
  if (!isVerifiedAdmin(currentUser)) return res.status(403).json({ success: false, error: 'Admin access required' });

  const body = (req.body || {}) as Record<string, any>;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || String(body.channelId || '').trim() || '@OSot_uz';

  if (!token) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'Telegram token is not configured on the server'
    });
  }

  const listing = body.listing as Record<string, any> | undefined;
  if (!listing) return res.status(400).json({ success: false, error: 'listing is required' });
  if (listing.status && listing.status !== 'active') {
    return res.status(409).json({ success: false, error: 'Only active listings can be published to Telegram' });
  }

  const listingId = String(listing.id || '').trim();
  if (!listingId) return res.status(400).json({ success: false, error: 'listing id is required' });
  const baseUrl = normalizePublicOrigin(body.appUrl);
  const url = `${baseUrl}/l/${encodeURIComponent(toPublicListingId(listingId))}`;

  const caption = buildCaption(listing, url);
  const firstImage = Array.isArray(listing.images) ? String(listing.images[0] || '') : '';

  try {
    if (firstImage) {
      try {
        const photoResult = await sendPhotoCard(token, channelId, firstImage, caption, url);
        if (photoResult?.response.ok && photoResult.data.ok) {
          return res.status(200).json({
            success: true,
            messageId: photoResult.data.result?.message_id || null,
            channel: channelId,
            usedImage: true
          });
        }
      } catch (imageError) {
        console.warn('Telegram photo upload failed; falling back to text card:', imageError);
      }
    }

    const textResult = await sendTextCard(token, channelId, caption, url);
    if (!textResult.response.ok || !textResult.data.ok) {
      return res.status(502).json({
        success: false,
        configured: true,
        error: `Telegram publish failed: ${textResult.data.description || 'unknown Telegram error'}`
      });
    }

    return res.status(200).json({
      success: true,
      messageId: textResult.data.result?.message_id || null,
      channel: channelId,
      usedImage: false
    });
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      configured: true,
      error: `Telegram publishing failed: ${error?.message || 'network error'}`
    });
  }
}
