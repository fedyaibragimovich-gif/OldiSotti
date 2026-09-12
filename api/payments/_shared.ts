import { randomBytes } from 'node:crypto';
import { extractBearerToken } from '../_shared';

export const VIP_PRICE_PER_DAY_UZS = 25_000;
export const ALLOWED_PLAN_DAYS = new Set([1, 3, 7]);
export const FIREBASE_PROJECT_ID = 'gen-lang-client-0261863601';
export const FIRESTORE_DATABASE_ID = 'ai-studio-bazaarbuilder-41fa17d8-6b10-46d7-a618-e3efc2bd76de';

export type PaymentProvider = 'click' | 'payme';

export function createPaymentOrderId(provider: PaymentProvider): string {
  return `${provider}_${Date.now()}_${randomBytes(10).toString('hex')}`;
}

export function getVipAmountUzs(planDays: number): number {
  return VIP_PRICE_PER_DAY_UZS * planDays;
}

function firestoreValue(value: unknown): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  throw new Error('Unsupported Firestore value');
}

export async function createPendingPaymentOrder(params: {
  req: any;
  orderId: string;
  provider: PaymentProvider;
  userId: string;
  listingId: string;
  planDays: number;
  amountUzs: number;
}): Promise<void> {
  const idToken = extractBearerToken(params.req);
  if (!idToken) throw new Error('Authentication required');

  const fields: Record<string, any> = {
    userId: firestoreValue(params.userId),
    listingId: firestoreValue(params.listingId),
    provider: firestoreValue(params.provider),
    planDays: firestoreValue(params.planDays),
    amountUzs: firestoreValue(params.amountUzs),
    status: firestoreValue('pending'),
    createdAt: firestoreValue(new Date().toISOString()),
    updatedAt: firestoreValue(new Date().toISOString())
  };

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents/payment_orders`
  );
  url.searchParams.set('documentId', params.orderId);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    console.error('Failed to persist payment order:', response.status, message.slice(0, 500));
    if (response.status === 403) throw new Error('Listing ownership could not be verified');
    throw new Error('Could not create payment order');
  }
}
