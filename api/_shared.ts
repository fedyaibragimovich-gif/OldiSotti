export interface TelegramPostResponse {
  success: boolean;
  messageId?: number;
  simulated?: boolean;
  isConfigured?: boolean;
  channel?: string;
  error?: string;
  formattedCaption?: string;
  telegramPostUrl?: string;
}

export interface TelegramConnectionResponse {
  success: boolean;
  simulated?: boolean;
  isConfigured?: boolean;
  bot?: {
    id: number;
    first_name: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
  };
  channel?: {
    id: number | string;
    title?: string;
    username?: string;
    type?: string;
  };
  error?: string;
  message?: string;
}

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAITdHp6PssWTS-LWTpjQ49faSn1ozXoOU';
const ADMIN_UID = 'Q81AQDKw7GXYeNgdrnp2qvYgyS02';
const ADMIN_EMAILS = new Set(['fedya.ibragimovich@gmail.com']);

export interface VerifiedFirebaseUser {
  localId: string;
  email?: string;
  emailVerified?: boolean;
}

export function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    if (typeof req.on !== 'function') {
      return resolve({});
    }
    req.on('data', (chunk: any) => {
      data += chunk;
      if (data.length > 10 * 1024 * 1024) {
        data = '';
        req.destroy?.();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function extractBearerToken(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

const tokenCache = new Map<string, { user: VerifiedFirebaseUser; expiresAt: number }>();

export async function verifyFirebaseUser(req: any): Promise<VerifiedFirebaseUser | null> {
  const idToken = extractBearerToken(req);
  if (!idToken) return null;

  const now = Date.now();
  const cached = tokenCache.get(idToken);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  if (tokenCache.size > 1000) {
    for (const [key, value] of tokenCache.entries()) {
      if (value.expiresAt <= now) tokenCache.delete(key);
    }
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!response.ok) return null;
    const data = await response.json() as any;
    const user = Array.isArray(data.users) ? data.users[0] : null;
    if (!user?.localId) return null;
    const verifiedUser: VerifiedFirebaseUser = {
      localId: String(user.localId),
      email: typeof user.email === 'string' ? user.email : undefined,
      emailVerified: Boolean(user.emailVerified)
    };
    tokenCache.set(idToken, { user: verifiedUser, expiresAt: now + 2 * 60 * 1000 });
    return verifiedUser;
  } catch {
    return null;
  }
}

export function isVerifiedAdmin(user: VerifiedFirebaseUser | null): boolean {
  if (!user) return false;
  if (user.localId === ADMIN_UID) return true;
  const email = user.email?.toLowerCase();
  return Boolean(email && user.emailVerified && ADMIN_EMAILS.has(email));
}

export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
