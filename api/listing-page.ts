type AnyRecord = Record<string, any>;

const FIREBASE_PROJECT_ID = 'gen-lang-client-0261863601';
const FIREBASE_DATABASE_ID = 'ai-studio-bazaarbuilder-41fa17d8-6b10-46d7-a618-e3efc2bd76de';
// Firebase web API keys are public client configuration; Firestore Security Rules enforce access.
const FIREBASE_WEB_API_KEY = 'AIzaSyAITdHp6PssWTS-LWTpjQ49faSn1ozXoOU';

const LEGACY_DEMO_ID = /^olx-(\d+)$/i;
const PUBLIC_DEMO_ID = /^oldisotdi-demo-(\d+)$/i;

function toPublicListingId(id: string): string {
  const match = LEGACY_DEMO_ID.exec(id);
  return match ? `oldisotdi-demo-${match[1]}` : id;
}

function toLegacyListingId(id: string): string {
  const match = PUBLIC_DEMO_ID.exec(id);
  return match ? `olx-${match[1]}` : id;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeFirestoreValue(value: AnyRecord | undefined): any {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map((item: AnyRecord) => decodeFirestoreValue(item));
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue?.fields || {});
  return undefined;
}

function decodeFirestoreFields(fields: AnyRecord): AnyRecord {
  const result: AnyRecord = {};
  for (const [key, value] of Object.entries(fields || {})) {
    result[key] = decodeFirestoreValue(value as AnyRecord);
  }
  return result;
}

async function fetchListingById(listingId: string): Promise<AnyRecord | null> {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/${encodeURIComponent(FIREBASE_DATABASE_ID)}/documents/listings/${encodeURIComponent(listingId)}?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`;
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const document = await response.json() as AnyRecord;
    const listing = decodeFirestoreFields(document.fields || {});
    return listing && listing.status === 'active' ? { ...listing, id: listingId } : null;
  } catch {
    return null;
  }
}

async function fetchListing(requestedId: string): Promise<AnyRecord | null> {
  // Prefer the requested (new) ID so future migrated documents work directly.
  const direct = await fetchListingById(requestedId);
  if (direct) return direct;

  // Compatibility fallback for demo documents seeded before the rebrand.
  const legacyId = toLegacyListingId(requestedId);
  if (legacyId === requestedId) return null;
  return fetchListingById(legacyId);
}

function formatPrice(price: unknown, currency: unknown): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return '';
  if (currency === 'USD') return `$ ${new Intl.NumberFormat('en-US').format(amount)}`;
  return `${new Intl.NumberFormat('uz-UZ').format(amount)} so'm`;
}

function replaceMeta(html: string, selector: RegExp, replacement: string): string {
  return selector.test(html) ? html.replace(selector, replacement) : html;
}

function injectListingMeta(html: string, listing: AnyRecord, canonicalUrl: string): string {
  const price = formatPrice(listing.price, listing.currency);
  const title = `${String(listing.title || 'E\'lon')} — ${price} | OldiSotdi`;
  const descriptionRaw = String(listing.description || `${listing.title || 'E\'lon'} — OldiSotdi`)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  const image = Array.isArray(listing.images) && typeof listing.images[0] === 'string' ? listing.images[0] : '';

  html = replaceMeta(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, /<meta\s+name=["']title["'][^>]*>/i, `<meta name="title" content="${escapeHtml(title)}" />`);
  html = replaceMeta(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(descriptionRaw)}" />`);
  html = replaceMeta(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  html = replaceMeta(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  html = replaceMeta(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceMeta(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(descriptionRaw)}" />`);
  html = replaceMeta(html, /<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />`);
  html = replaceMeta(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceMeta(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(descriptionRaw)}" />`);

  if (image) {
    html = replaceMeta(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`);
    html = replaceMeta(html, /<meta\s+property=["']og:image:alt["'][^>]*>/i, `<meta property="og:image:alt" content="${escapeHtml(String(listing.title || 'OldiSotdi e\'loni'))}" />`);
    html = replaceMeta(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }

  return html;
}

function injectSpaDeepLink(html: string, listingId: string): string {
  const target = `/?listing=${encodeURIComponent(listingId)}`;
  const script = `<script>try{history.replaceState({},'',${JSON.stringify(target)})}catch(e){}</script>`;
  return html.includes('</head>') ? html.replace('</head>', `${script}\n  </head>`) : `${script}${html}`;
}

function deploymentOrigin(): string {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return `https://${productionHost.replace(/^https?:\/\//, '')}`;
  return 'https://fedyaibragimovich-gif.vercel.app';
}

async function fetchBaseHtml(): Promise<string> {
  const deploymentHost = process.env.VERCEL_URL?.trim();
  const origin = deploymentHost
    ? `https://${deploymentHost.replace(/^https?:\/\//, '')}`
    : deploymentOrigin();
  const response = await fetch(`${origin}/`, {
    headers: { 'user-agent': 'OldiSotdi-Listing-Renderer/1.0' },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(`base-html-${response.status}`);
  return response.text();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const rawId = Array.isArray(req.query?.listing) ? req.query.listing[0] : req.query?.listing;
  const requestedId = typeof rawId === 'string' ? rawId.trim() : '';
  if (!requestedId || requestedId.length > 160 || !/^[A-Za-z0-9._:-]+$/.test(requestedId)) {
    return res.status(400).send('Invalid listing id');
  }

  // Never expose the pre-rebrand OLX demo prefix in public URLs.
  const publicId = toPublicListingId(requestedId);
  if (publicId !== requestedId) {
    res.setHeader('Location', `/l/${encodeURIComponent(publicId)}`);
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(308).end();
  }

  try {
    const [baseHtml, listing] = await Promise.all([fetchBaseHtml(), fetchListing(requestedId)]);
    const canonicalUrl = `${deploymentOrigin()}/l/${encodeURIComponent(publicId)}`;
    const withMeta = listing ? injectListingMeta(baseHtml, listing, canonicalUrl) : baseHtml;
    // If the document still has a legacy Firestore ID, hand that internal ID to the SPA.
    const internalId = listing?.id || requestedId;
    const output = injectSpaDeepLink(withMeta, internalId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', listing ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(output);
  } catch {
    return res.status(503).send('Temporarily unavailable');
  }
}
