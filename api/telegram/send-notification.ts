import { verifyFirebaseUser } from '../_shared.js';

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const currentUser = await verifyFirebaseUser(req);
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(503).json({ success: false, configured: false, error: 'Telegram token is not configured on the server' });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const sellerTelegram = String(body.sellerTelegram || '').trim();
  const listingTitle = String(body.listingTitle || '').trim();
  const buyerName = String(body.buyerName || 'Foydalanuvchi').trim();
  const messageText = String(body.messageText || '').trim();
  const listingId = String(body.listingId || '').trim();

  if (!sellerTelegram || !messageText) {
    return res.status(400).json({ success: false, error: 'sellerTelegram and messageText are required' });
  }

  const normalizedChatId = sellerTelegram.replace(/^@/, '');
  const isNumericChatId = /^-?\d+$/.test(normalizedChatId);

  if (!isNumericChatId) {
    return res.status(200).json({
      success: false,
      configured: true,
      reason: 'Telegram username cannot be used as a private bot chat_id until the seller has started the bot.',
      contactUrl: `https://t.me/${normalizedChatId}`
    });
  }

  const safeTitle = listingTitle.slice(0, 120);
  const safeBuyer = buyerName.slice(0, 80);
  const safeText = messageText.slice(0, 1500);
  const listingLine = listingId ? `\nE'lon ID: ${listingId}` : '';
  const text = `📩 OldiSotdi xabarnomasi\n\n👤 ${safeBuyer}\n📌 ${safeTitle || 'E\'lon'}${listingLine}\n\n${safeText}`;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: normalizedChatId, text, disable_web_page_preview: true })
    });
    const telegramData = await telegramResponse.json().catch(() => ({})) as { ok?: boolean; description?: string };
    if (!telegramResponse.ok || !telegramData.ok) {
      return res.status(502).json({ success: false, configured: true, error: telegramData.description || 'Telegram notification failed' });
    }
    return res.status(200).json({ success: true, configured: true });
  } catch (error: any) {
    return res.status(502).json({ success: false, configured: true, error: error?.message || 'Telegram notification failed' });
  }
}
