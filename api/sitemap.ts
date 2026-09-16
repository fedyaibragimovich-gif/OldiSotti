const FIREBASE_PROJECT_ID = 'gen-lang-client-0261863601';
const FIREBASE_DATABASE_ID = 'ai-studio-bazaarbuilder-41fa17d8-6b10-46d7-a618-e3efc2bd76de';
// Firebase web API keys are public client configuration; Firestore rules enforce access.
const FIREBASE_WEB_API_KEY = 'AIzaSyAITdHp6PssWTS-LWTpjQ49faSn1ozXoOU';

const LEGACY_DEMO_ID = /^olx-(\d+)$/i;

function toPublicListingId(id: string): string {
  const match = LEGACY_DEMO_ID.exec(id);
  return match ? `oldisotdi-demo-${match[1]}` : id;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function deploymentOrigin(): string {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return `https://${productionHost.replace(/^https?:\/\//, '')}`;
  return 'https://fedyaibragimovich-gif.vercel.app';
}

async function fetchActiveListingIds(): Promise<string[]> {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/${encodeURIComponent(FIREBASE_DATABASE_ID)}/documents:runQuery?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'listings' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'status' },
            op: 'EQUAL',
            value: { stringValue: 'active' }
          }
        },
        select: { fields: [{ fieldPath: '__name__' }] },
        limit: 5000
      }
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) throw new Error(`Firestore sitemap query failed: ${response.status}`);
  const rows = await response.json() as Array<{ document?: { name?: string } }>;
  const ids = rows
    .map((row) => row.document?.name?.split('/').pop() || '')
    .filter((id) => /^[A-Za-z0-9._:-]{1,160}$/.test(id))
    .map(toPublicListingId);
  return [...new Set(ids)];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const origin = deploymentOrigin().replace(/\/$/, '');
    const listingIds = await fetchActiveListingIds();
    const urls = [
      `${origin}/`,
      ...listingIds.map((id) => `${origin}/l/${encodeURIComponent(id)}`)
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n')}\n</urlset>\n`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(body);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return res.status(503).send('Sitemap temporarily unavailable');
  }
}
