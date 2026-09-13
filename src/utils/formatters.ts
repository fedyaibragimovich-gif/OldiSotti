import { Currency } from '../types';

// An indicative display rate, not a payment quote.
export const USD_TO_UZS_RATE = 12750;
export const EXCHANGE_RATE_NOTE = 'Taxminiy hisob: 1 USD = 12 750 so‘m. Bank kursi emas.';

export function formatPrice(amount: number, currency: Currency, targetCurrency?: Currency): string {
  if (amount === 0) {
    return '0 so\'m (Tekinga)';
  }

  // If user selected a specific target currency to view in:
  if (targetCurrency && targetCurrency !== currency) {
    if (targetCurrency === 'USD' && currency === 'UZS') {
      const converted = Math.round(amount / USD_TO_UZS_RATE);
      return `$ ${converted.toLocaleString('en-US')}`;
    }
    if (targetCurrency === 'UZS' && currency === 'USD') {
      const converted = amount * USD_TO_UZS_RATE;
      return `${converted.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
    }
  }

  if (currency === 'USD') {
    return `$ ${amount.toLocaleString('en-US')}`;
  }

  return `${amount.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
}

export function formatPriceSecondary(amount: number, currency: Currency): string {
  if (amount === 0) return '';
  if (currency === 'USD') {
    const uzs = amount * USD_TO_UZS_RATE;
    return `≈ ${uzs.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
  } else {
    const usd = Math.round(amount / USD_TO_UZS_RATE);
    return `≈ $ ${usd.toLocaleString('en-US')}`;
  }
}

export function maskPhoneNumber(phone: string): string {
  // Format like +998 90 ••• •• 56
  const clean = phone.trim();
  if (clean.length < 9) return phone;
  const parts = clean.split(' ');
  if (parts.length >= 4) {
    return `${parts[0]} ${parts[1]} ••• •• ${parts[parts.length - 1]}`;
  }
  return `${clean.slice(0, 7)} ••• •• ${clean.slice(-2)}`;
}

export function formatDisplayDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
