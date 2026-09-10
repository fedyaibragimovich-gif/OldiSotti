type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(price: unknown, currency?: string, negotiable?: boolean): string {
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) return String(price ?? '');
  const formatted = numeric.toLocaleString('uz-UZ');
  const value = currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
  return negotiable ? `${value} (kelishiladi)` : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@OSot_uz';

  if (!token) {
    return res.status(503).json({ success: false, configured: false, error: 'Telegram token is not configured on the server' });
  }

  const body = (req.body || {}) as Record<string, any>;
  const listing = body.listing as Record<string, any> | undefined;

  const title = String(listing?.title ?? body.title ?? '').trim();
  const price = listing
    ? formatPrice(listing.price, listing.currency, Boolean(listing.isNegotiable))
    : String(body.price || '').trim();
  const baseUrl = String(body.appUrl || '').trim() || 'https://oldisotti.uz';
  const url = listing
    ? `${baseUrl}/?listing=${encodeURIComponent(String(listing.id || ''))}`
    : String(body.url || '').trim();
  const imageUrl = String(listing?.images?.[0] ?? body.imageUrl ?? '').trim();
  const description = String(listing?.description ?? body.description ?? '').trim();
  const location = listing?.location
    ? `${String(listing.location.region || '')}${listing.location.district ? `, ${String(listing.location.district)}` : ''}`
    : String(body.location || '').trim();
  const category = listing
    ? `${String(listing.categoryId || '')}${listing.brand ? ` • ${String(listing.brand)}` : ''}`
    : String(body.category || '').trim();

  if (!title || (!listing && !url)) {
    return res.status(400).json({ success: false, error: 'title and url are required' });
  }

  if (listing?.status && listing.status !== 'active') {
    return res.status(409).json({ success: false, error: 'Only active listings can be published to Telegram' });
  }

  const lines = [
    `<b>${escapeHtml(title)}</b>`,
    price ? `💰 ${escapeHtml(price)}` : '',
    category ? `📂 ${escapeHtml(category)}` : '',
    location ? `📍 ${escapeHtml(location)}` : '',
    description ? `\n${escapeHtml(description.slice(0, 700))}` : '',
    `\n🔗 <a href="${escapeHtml(url)}">E'lonni ko'rish</a>`,
    `\n#OldiSotti`
  ].filter(Boolean);

  const message = lines.join('\n');

  async function sendMessage(): Promise<Response> {
    return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
  }

  try {
    // First try the listing image. If Telegram cannot fetch the image URL,
    // fall back to a text post so a valid listing is not lost.
    let telegramResponse: Response;
    let usedImage = false;

    if (imageUrl) {
      telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          photo: imageUrl,
          caption: message,
          parse_mode: 'HTML'
        })
      });
      usedImage = telegramResponse.ok;

      if (!telegramResponse.ok) {
        const failedPhoto = await telegramResponse.json().catch(() => ({})) as { description?: string };
        telegramResponse = await sendMessage();
        if (!telegramResponse.ok) {
          const failedText = await telegramResponse.json().catch(() => ({})) as { description?: string };
          return res.status(502).json({
            success: false,
            configured: true,
            error: `Telegram publish failed: ${failedText.description || failedPhoto.description || 'unknown Telegram error'}`,
            photoError: failedPhoto.description || null
          });
        }
      }
    } else {
      telegramResponse = await sendMessage();
    }

    const telegramData = await telegramResponse.json().catch(() => ({})) as {
      ok?: boolean;
      result?: { message_id?: number };
      description?: string;
    };

    if (!telegramResponse.ok || !telegramData.ok) {
      return res.status(502).json({
        success: false,
        configured: true,
        error: `Telegram publish failed: ${telegramData.description || 'unknown Telegram error'}`
      });
    }

    return res.status(200).json({
      success: true,
      messageId: telegramData.result?.message_id || null,
      channel: channelId,
      usedImage
    });
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      configured: true,
      error: `Telegram publishing failed: ${error?.message || 'network error'}`
    });
  }
}
