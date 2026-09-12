export default function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(200).json({
    status: 'ok',
    platform: 'OldiSotti Uzbekistan Classifieds API',
    timestamp: new Date().toISOString()
  });
}
