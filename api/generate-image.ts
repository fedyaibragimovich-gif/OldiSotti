import { parseJsonBody, setCorsHeaders } from './_shared';
import { GoogleGenAI } from '@google/genai';

const CATEGORY_PLACEHOLDERS: Record<string, string[]> = {
  transport: [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  ],
  realestate: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
  ],
  sport: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80'
  ],
  general: [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'
  ]
};

const CAR_SPECIFIC_PLACEHOLDERS: Record<string, string[]> = {
  damas: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20100908_daewoo_damas2_01.jpg/1280px-20100908_daewoo_damas2_01.jpg'
  ],
  labo: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/20140420_Daewoo_Labo_1.jpg/1280px-20140420_Daewoo_Labo_1.jpg'
  ],
  cobalt: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg'
  ],
  gentra: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2008_Chevrolet_Lacetti_SE_1.4_Front.jpg/1280px-2008_Chevrolet_Lacetti_SE_1.4_Front.jpg'
  ],
  nexia: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/1996_Daewoo_Nexia_1.5i_GLX_sedan.jpg/1280px-1996_Daewoo_Nexia_1.5i_GLX_sedan.jpg'
  ]
};

function getFallbackImage(title: string, categoryId?: string): string {
  const t = title.toLowerCase();
  const c = (categoryId || '').toLowerCase();
  if (t.includes('damas')) return CAR_SPECIFIC_PLACEHOLDERS.damas[0];
  if (t.includes('labo')) return CAR_SPECIFIC_PLACEHOLDERS.labo[0];
  if (t.includes('cobalt')) return CAR_SPECIFIC_PLACEHOLDERS.cobalt[0];
  if (t.includes('gentra') || t.includes('lacetti')) return CAR_SPECIFIC_PLACEHOLDERS.gentra[0];
  if (t.includes('nexia')) return CAR_SPECIFIC_PLACEHOLDERS.nexia[0];

  let matchedCategory = 'general';
  if (c.includes('transport') || t.includes('moshina') || t.includes('mashina') || t.includes('avto')) matchedCategory = 'transport';
  else if (c.includes('realestate') || t.includes('kvartira') || t.includes('uy')) matchedCategory = 'realestate';
  else if (c.includes('electronics') || t.includes('iphone') || t.includes('telefon') || t.includes('noutbuk')) matchedCategory = 'electronics';
  else if (c.includes('furniture') || t.includes('mebel')) matchedCategory = 'furniture';
  else if (c.includes('fashion') || t.includes('kiyim') || t.includes('poyabzal')) matchedCategory = 'fashion';
  else if (c.includes('sport') || t.includes('velosiped')) matchedCategory = 'sport';

  const pool = CATEGORY_PLACEHOLDERS[matchedCategory] || CATEGORY_PLACEHOLDERS.general;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { prompt, title, categoryId, aspectRatio = '4:3' } = body;
    const rawSubject = (prompt || title || 'Mahsulot').trim();
    const subjectCheck = `${rawSubject} ${title || ''}`.toLowerCase();

    if (subjectCheck.includes('damas')) {
      return res.status(200).json({
        success: true,
        source: 'exact_model',
        imageUrl: CAR_SPECIFIC_PLACEHOLDERS.damas[0],
        fallbackUrl: CAR_SPECIFIC_PLACEHOLDERS.damas[0]
      });
    }
    if (subjectCheck.includes('labo')) {
      return res.status(200).json({
        success: true,
        source: 'exact_model',
        imageUrl: CAR_SPECIFIC_PLACEHOLDERS.labo[0],
        fallbackUrl: CAR_SPECIFIC_PLACEHOLDERS.labo[0]
      });
    }
    if (subjectCheck.includes('cobalt')) {
      return res.status(200).json({
        success: true,
        source: 'exact_model',
        imageUrl: CAR_SPECIFIC_PLACEHOLDERS.cobalt[0],
        fallbackUrl: CAR_SPECIFIC_PLACEHOLDERS.cobalt[0]
      });
    }
    if (subjectCheck.includes('gentra') || subjectCheck.includes('lacetti')) {
      return res.status(200).json({
        success: true,
        source: 'exact_model',
        imageUrl: CAR_SPECIFIC_PLACEHOLDERS.gentra[0],
        fallbackUrl: CAR_SPECIFIC_PLACEHOLDERS.gentra[0]
      });
    }
    if (subjectCheck.includes('nexia')) {
      return res.status(200).json({
        success: true,
        source: 'exact_model',
        imageUrl: CAR_SPECIFIC_PLACEHOLDERS.nexia[0],
        fallbackUrl: CAR_SPECIFIC_PLACEHOLDERS.nexia[0]
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: `Commercial product photo: ${rawSubject}. Clean studio lighting, photorealistic, 4k.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: (['1:1', '3:4', '4:3', '16:9'].includes(aspectRatio) ? aspectRatio : '4:3') as any
            }
          }
        });

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return res.status(200).json({
                success: true,
                source: 'gemini',
                imageUrl: `data:${mime};base64,${part.inlineData.data}`
              });
            }
          }
        }
      } catch (geminiError) {
        // Fall back gracefully
      }
    }

    const seed = Math.floor(Math.random() * 100000);
    const cleanSubject = encodeURIComponent(`${rawSubject} product photorealistic`);
    const generativeUrl = `https://image.pollinations.ai/prompt/${cleanSubject}?width=800&height=600&nologo=true&seed=${seed}`;

    return res.status(200).json({
      success: true,
      source: 'ai',
      imageUrl: generativeUrl,
      fallbackUrl: getFallbackImage(title || prompt || '', categoryId)
    });
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      source: 'placeholder',
      imageUrl: getFallbackImage(req.body?.title || '', req.body?.categoryId)
    });
  }
}
