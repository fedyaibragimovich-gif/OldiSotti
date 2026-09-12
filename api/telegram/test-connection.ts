import { isVerifiedAdmin, verifyFirebaseUser } from '../_shared.js';

type VercelRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const currentUser = await verifyFirebaseUser(req);
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (!isVerifiedAdmin(currentUser)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@OSot_uz';
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'OSotBot';

  if (!token) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'Telegram token is not configured on the server'
    });
  }

  try {
    const botResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const botData = await botResponse.json() as any;

    if (!botResponse.ok || !botData.ok) {
      return res.status(502).json({
        success: false,
        configured: true,
        error: 'Telegram bot authentication failed'
      });
    }

    let channel = null;
    try {
      const channelResponse = await fetch(
        `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(channelId)}`
      );
      const channelData = await channelResponse.json() as any;
      if (channelResponse.ok && channelData.ok) {
        channel = {
          id: channelData.result.id,
          title: channelData.result.title,
          username: channelData.result.username,
          type: channelData.result.type
        };
      }
    } catch {
      // Bot authentication is still valid even if channel lookup fails.
    }

    return res.status(200).json({
      success: true,
      configured: true,
      bot: {
        id: botData.result.id,
        first_name: botData.result.first_name,
        username: botData.result.username || botUsername
      },
      channel: channel || { username: channelId },
      links: {
        bot: `https://t.me/${String(botData.result.username || botUsername).replace('@', '')}`,
        channel: channelId.startsWith('@')
          ? `https://t.me/${channelId.slice(1)}`
          : undefined
      }
    });
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      configured: true,
      error: error?.message || 'Telegram connection failed'
    });
  }
}
