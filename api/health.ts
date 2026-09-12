import { setCorsHeaders } from './_shared';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Do not expose whether server-side secrets are configured.
  res.status(200).json({
    status: 'ok',
    platform: 'OldiSotti Uzbekistan Classifieds API',
    timestamp: new Date().toISOString()
  });
}
