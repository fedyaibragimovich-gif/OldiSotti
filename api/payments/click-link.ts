type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const serviceId = process.env.CLICK_SERVICE_ID;
  const merchantId = process.env.CLICK_MERCHANT_ID;
  if (!serviceId || !merchantId) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'Click merchant is not configured on the server'
    });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const orderId = String(body.orderId || '').trim();
  const amountUzs = Number(body.amountUzs);
  const returnUrl = String(body.returnUrl || 'https://oldisotti.uz').trim();

  if (!orderId || !Number.isFinite(amountUzs) || amountUzs <= 0) {
    return res.status(400).json({
      success: false,
      error: 'orderId and a positive amountUzs are required'
    });
  }

  const url = new URL('https://my.click.uz/services/pay');
  url.searchParams.set('service_id', serviceId);
  url.searchParams.set('merchant_id', merchantId);
  url.searchParams.set('amount', amountUzs.toFixed(2));
  url.searchParams.set('transaction_param', orderId);
  url.searchParams.set('return_url', returnUrl);

  return res.status(200).json({
    success: true,
    provider: 'click',
    orderId,
    amountUzs,
    checkoutUrl: url.toString()
  });
}
