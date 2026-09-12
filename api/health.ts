import { setCorsHeaders } from './_shared';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ok',
    platform: 'OldiSotti Uzbekistan Classifieds API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTelegramToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    timestamp: new Date().toISOString()
  });
}
