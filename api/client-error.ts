type AnyRecord = Record<string, unknown>;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function requestHost(req: any): string {
  const raw = req.headers?.['x-forwarded-host'] || req.headers?.host || '';
  return String(Array.isArray(raw) ? raw[0] : raw).split(',')[0].trim().toLowerCase();
}

function originMatchesHost(req: any): boolean {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try {
    return new URL(String(origin)).host.toLowerCase() === requestHost(req);
  } catch {
    return false;
  }
}

function normalizedBody(req: any): AnyRecord {
  if (req.body && typeof req.body === 'object') return req.body as AnyRecord;
  if (typeof req.body === 'string' && req.body.length <= 16_000) {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' ? parsed as AnyRecord : {};
    } catch {
      return {};
    }
  }
  return {};
}

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  if (!originMatchesHost(req)) {
    return res.status(403).end();
  }

  const body = normalizedBody(req);
  const message = text(body.message, 1200);
  if (!message) return res.status(400).end();

  // Keep telemetry intentionally small and privacy-preserving. Do not accept
  // arbitrary user/session data, email addresses, auth tokens, or full referrers.
  const record = {
    event: 'oldisotdi_client_error',
    name: text(body.name, 120) || 'Error',
    message,
    stack: text(body.stack, 6000),
    context: text(body.context, 120),
    path: text(body.path, 1000).replace(/([?&](?:token|key|code|auth|email)=[^&]*)/gi, ''),
    userAgent: text(body.userAgent, 500),
    occurredAt: text(body.occurredAt, 80),
    receivedAt: new Date().toISOString()
  };

  console.error(JSON.stringify(record));
  return res.status(204).end();
}
