import { parseJsonBody } from './_shared';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAITdHp6PssWTS-LWTpjQ49faSn1ozXoOU';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image';

const rateStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_IMAGE_DATA_URL = 8 * 1024 * 1024;

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateStore.size > 1000) {
    for (const [key, value] of rateStore.entries()) {
      if (value.resetAt <= now) rateStore.delete(key);
    }
  }
  const current = rateStore.get(ip);
  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function extractBearer(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

async function verifyFirebaseIdToken(idToken: string): Promise<boolean> {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  if (!response.ok) return false;
  const data = await response.json() as any;
  return Array.isArray(data.users) && data.users.length > 0;
}

function parseImageDataUrl(value: unknown): { mimeType: string; data: string } | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_IMAGE_DATA_URL) return null;
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Faqat POST so\'roviga ruxsat berilgan.' });
    return;
  }

  if (!GEMINI_API_KEY) {
    res.status(503).json({ error: 'AI xizmati hali sozlanmagan. Vercel Environment Variables ichiga GEMINI_API_KEY qo\'shing.' });
    return;
  }

  const ip = getClientIp(req);
  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'AI generator limiti tugadi. Bir soatdan keyin qayta urinib ko\'ring.' });
    return;
  }

  const idToken = extractBearer(req);
  if (!idToken) {
    res.status(401).json({ error: 'AI generatoridan foydalanish uchun akkauntga kiring.' });
    return;
  }

  try {
    const verified = await verifyFirebaseIdToken(idToken);
    if (!verified) {
      res.status(401).json({ error: 'Sessiya yaroqsiz yoki muddati tugagan. Qayta kiring.' });
      return;
    }

    const body = await parseJsonBody(req);
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 160) : '';
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 800) : '';
    const style = typeof body.style === 'string' ? body.style.slice(0, 240) : 'clean professional e-commerce studio photography';
    const sourceImage = parseImageDataUrl(body.imageDataUrl);

    if (!title && !prompt) {
      res.status(400).json({ error: 'Mahsulot nomi yoki tavsifini kiriting.' });
      return;
    }

    const text = [
      'Create a photorealistic marketplace product photograph for OldiSotti.',
      `Product: ${title || prompt}`,
      prompt ? `Additional description: ${prompt}` : '',
      `Visual style: ${style}.`,
      sourceImage
        ? 'Use the supplied product photo as the primary reference. Preserve the exact product identity, shape, color, proportions, logos, labels and important details. Improve only presentation, lighting, background and composition. Do not invent a different product.'
        : 'If no source photo is provided, create a realistic product image based on the description. Do not add misleading brand claims or text that was not supplied.',
      'Make it suitable for a classifieds listing: centered product, realistic materials, natural shadows, clean composition, no watermark, no promotional text, no fake specifications.'
    ].filter(Boolean).join('\n');

    const input: any[] = [{ type: 'text', text }];
    if (sourceImage) {
      input.unshift({ type: 'image', mime_type: sourceImage.mimeType, data: sourceImage.data });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        response_format: {
          type: 'image',
          mime_type: 'image/png',
          aspect_ratio: '1:1',
          image_size: '1K'
        }
      })
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error('Gemini image API error:', data?.error?.message || response.status);
      res.status(502).json({ error: 'AI rasm xizmati hozir javob bermadi. Birozdan keyin qayta urinib ko\'ring.' });
      return;
    }

    const image = data?.output_image;
    if (!image?.data) {
      res.status(502).json({ error: 'AI rasm yaratilmadi. Boshqa tavsif bilan qayta urinib ko\'ring.' });
      return;
    }

    res.status(200).json({
      success: true,
      imageDataUrl: `data:${image.mime_type || 'image/png'};base64,${image.data}`,
      aiGenerated: true,
      model: MODEL
    });
  } catch (error: any) {
    console.error('AI product image endpoint error:', error?.message || error);
    res.status(500).json({ error: 'AI rasm yaratishda kutilmagan xatolik yuz berdi.' });
  }
}
