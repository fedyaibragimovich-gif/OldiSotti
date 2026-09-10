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

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@OSot_uz';

  if (!token) {
    return res.status(503).json({ success: false, configured: false, error: 'Telegram token is not configured on the server' });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const title = String(body.title || '').trim();
  const price = String(body.price || '').trim();
  const url = String(body.url || '').trim();
  const imageUrl = String(body.imageUrl || '').trim();
  const description = String(body.description || '').trim();
  const location = String(body.location || '').trim();
  const category = String(body.category || '').trim();

  if (!title || !url) {
    return res.status(400).json({ success: false, error: 'title and url are required' });
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

  try {
    let telegramResponse: Response;

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
    } else {
      telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

    const telegramData = await telegramResponse.json() as { ok?: boolean; result?: { message_id?: number }; description?: string };

    if (!telegramResponse.ok || !telegramData.ok) {
      return res.status(502).json({
        success: false,
        configured: true,
        error: 'Telegram could not publish the listing'
      });
    }

    return res.status(200).json({
      success: true,
      messageId: telegramData.result?.message_id || null,
      channel: channelId
    });
  } catch {
    return res.status(502).json({ success: false, configured: true, error: 'Telegram publishing failed' });
  }
}
