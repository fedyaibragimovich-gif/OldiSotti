export function normalizeUzbekPhoneToE164(value: string): string | null {
  let digits = String(value || '').replace(/\D/g, '');

  // Accept the common local form with a leading trunk zero as a convenience.
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length === 12 && digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  if (digits.length !== 9) return null;
  return `+998${digits}`;
}

export function normalizePhoneOtp(value: string): string | null {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
  return digits.length === 6 ? digits : null;
}
