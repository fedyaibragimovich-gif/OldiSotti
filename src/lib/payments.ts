import { auth } from './firebase';
export type PaymentProvider = 'click' | 'payme';
export interface CheckoutResult { success: boolean; provider?: PaymentProvider; orderId?: string; amountUzs?: number; checkoutUrl?: string; configured?: boolean; error?: string; }
async function createCheckout(provider: PaymentProvider, listingId: string, planDays: 1 | 3 | 7): Promise<CheckoutResult> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error('To‘lov uchun akkauntga kiring.');
  const response = await fetch(`/api/payments/${provider}-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ listingId, planDays })
  });
  const data = await response.json() as CheckoutResult;
  if (!response.ok || !data.success || !data.checkoutUrl) throw new Error(data.error || 'To‘lovni boshlash imkoni bo‘lmadi.');
  return data;
}
export const createClickCheckout = (listingId: string, planDays: 1 | 3 | 7) => createCheckout('click', listingId, planDays);
export const createPaymeCheckout = (listingId: string, planDays: 1 | 3 | 7) => createCheckout('payme', listingId, planDays);
export async function openPaymentCheckout(provider: PaymentProvider, listingId: string, planDays: 1 | 3 | 7): Promise<void> {
  const result = await createCheckout(provider, listingId, planDays);
  window.location.assign(result.checkoutUrl!);
}
