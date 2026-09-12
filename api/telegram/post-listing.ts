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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = (req.body || {}) as Record<string, any>;
  const token = body.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const channelId = body.channelId || process.env.TELEGRAM_CHANNEL_ID || '@OSot_uz';

  if (!token) {
    return res.status(503).json({ success: false, configured: false, error: 'Telegram token is not configured on the server' });
  }
  const listing = body.listing as Record<string, any> | undefined;
  const baseUrl = String(body.appUrl || '').trim() || 'https://oldisotti.uz';
  const url = listing
    ? `${baseUrl}/?listing=${encodeURIComponent(String(listing.id || ''))}`
    : String(body.url || '').trim();

  if (!url) {
    return res.status(400).json({ success: false, error: 'listing url is required' });
  }

  if (listing?.status && listing.status !== 'active') {
    return res.status(409).json({ success: false, error: 'Only active listings can be published to Telegram' });
  }

  // Telegram channel posts intentionally contain no seller name, phone,
  // Telegram username, price, location, description, or other contact data.
  // The channel is only a gateway to the listing on OldiSotti.
  const message = `<a href="${escapeHtml(url)}">OldiSotti'da e'lonni ko'rish</a>`;

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
    const telegramResponse = await sendMessage();
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
