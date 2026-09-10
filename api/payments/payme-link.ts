type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function encodePaymeParams(params: Record<string, string>): string {
  return Buffer.from(
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join(';'),
    'utf8'
  ).toString('base64url');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const merchantId = process.env.PAYME_MERCHANT_ID;
  if (!merchantId) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'Payme merchant is not configured on the server'
    });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const orderId = String(body.orderId || '').trim();
  const amountUzs = Number(body.amountUzs);
  const returnUrl = String(body.returnUrl || 'https://oldisotti.uz').trim();

  if (!orderId || !Number.isInteger(amountUzs) || amountUzs <= 0) {
    return res.status(400).json({
      success: false,
      error: 'orderId and a positive integer amountUzs are required'
    });
  }

  const amountTiyn = amountUzs * 100;
  const encoded = encodePaymeParams({
    m: merchantId,
    'ac.order_id': orderId,
    a: String(amountTiyn),
    l: 'uz',
    c: returnUrl,
    cr: '860'
  });

  return res.status(200).json({
    success: true,
    provider: 'payme',
    orderId,
    amountUzs,
    checkoutUrl: `https://checkout.paycom.uz/${encoded}`
  });
}
