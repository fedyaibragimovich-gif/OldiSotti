import { parseJsonBody, setCorsHeaders, verifyFirebaseUser } from '../_shared';
import {
  ALLOWED_PLAN_DAYS,
  createPaymentOrderId,
  createPendingPaymentOrder,
  getVipAmountUzs
} from './_shared';

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  on?: (...args: any[]) => void;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
  setHeader: (name: string, value: string) => void;
};

const FALLBACK_SITE_URL = 'https://fedyaibragimovich-gif.vercel.app';

function encodePaymeParams(params: Record<string, string>): string {
  return Buffer.from(
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join(';'),
    'utf8'
  ).toString('base64url');
}

function getTrustedReturnUrl(): string {
  const configured = String(process.env.PUBLIC_SITE_URL || process.env.SITE_URL || FALLBACK_SITE_URL).trim();
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:') return FALLBACK_SITE_URL;
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Checkout stays unavailable until server-side provider callbacks are implemented and tested.
  res.status(503).json({ success: false, configured: false, error: 'VIP to‘lov xizmati hali ishga tushirilmagan.' });
  return;

  const user = await verifyFirebaseUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const merchantId = process.env.PAYME_MERCHANT_ID;
  if (!merchantId) {
    res.status(503).json({
      success: false,
      configured: false,
      error: 'Payme merchant is not configured on the server'
    });
    return;
  }

  const body = await parseJsonBody(req);
  const listingId = String(body?.listingId || '').trim();
  const planDays = Number(body?.planDays);

  if (!/^[-A-Za-z0-9_]{3,128}$/.test(listingId) || !Number.isInteger(planDays) || !ALLOWED_PLAN_DAYS.has(planDays)) {
    res.status(400).json({
      success: false,
      error: 'Valid listingId and planDays (1, 3 or 7) are required'
    });
    return;
  }

  const amountUzs = getVipAmountUzs(planDays);
  const amountTiyn = amountUzs * 100;
  const orderId = createPaymentOrderId('payme');

  try {
    await createPendingPaymentOrder({
      req,
      orderId,
      provider: 'payme',
      userId: user.localId,
      listingId,
      planDays,
      amountUzs
    });
  } catch (error: any) {
    res.status(error?.message === 'Listing ownership could not be verified' ? 403 : 500).json({
      success: false,
      error: error?.message || 'Could not create payment order'
    });
    return;
  }

  const returnUrl = getTrustedReturnUrl();
  const encoded = encodePaymeParams({
    m: merchantId,
    'ac.order_id': orderId,
    a: String(amountTiyn),
    l: 'uz',
    c: returnUrl,
    cr: '860'
  });

  res.status(200).json({
    success: true,
    provider: 'payme',
    orderId,
    listingId,
    planDays,
    amountUzs,
    checkoutUrl: `https://checkout.paycom.uz/${encoded}`
  });
}
