export type PaymentProvider = 'click' | 'payme';

export interface CheckoutResult {
  success: boolean;
  provider?: PaymentProvider;
  orderId?: string;
  amountUzs?: number;
  checkoutUrl?: string;
  configured?: boolean;
  error?: string;
}

async function createCheckout(
  provider: PaymentProvider,
  orderId: string,
  amountUzs: number,
  returnUrl = 'https://oldisotti.uz'
): Promise<CheckoutResult> {
  const response = await fetch(`/api/payments/${provider}-link`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId, amountUzs, returnUrl })
  });

  const data = (await response.json().catch(() => ({}))) as CheckoutResult;
  if (!response.ok || !data.success || !data.checkoutUrl) {
    throw new Error(data.error || `${provider} checkout yaratilmadi.`);
  }

  return data;
}

export const createClickCheckout = (orderId: string, amountUzs: number, returnUrl?: string) =>
  createCheckout('click', orderId, amountUzs, returnUrl);

export const createPaymeCheckout = (orderId: string, amountUzs: number, returnUrl?: string) =>
  createCheckout('payme', orderId, amountUzs, returnUrl);

export async function openPaymentCheckout(
  provider: PaymentProvider,
  orderId: string,
  amountUzs: number,
  returnUrl?: string
): Promise<void> {
  const result = await createCheckout(provider, orderId, amountUzs, returnUrl);
  window.location.assign(result.checkoutUrl!);
}
