const LEGACY_OLX_ID = /^olx-(.+)$/i;
const LEGACY_DEMO_ID = /^olx-(\d+)$/i;
const PUBLIC_DEMO_ID = /^oldisotdi-demo-(\d+)$/i;
const PUBLIC_LEGACY_ID = /^oldisotdi-listing-(.+)$/i;

/**
 * Keeps every pre-rebrand `olx-*` Firestore document ID private while exposing
 * only OldiSotdi-branded URLs to users and crawlers.
 */
export function toPublicListingId(id: string): string {
  const normalized = String(id || '').trim();
  const demoMatch = LEGACY_DEMO_ID.exec(normalized);
  if (demoMatch) return `oldisotdi-demo-${demoMatch[1]}`;

  const legacyMatch = LEGACY_OLX_ID.exec(normalized);
  return legacyMatch ? `oldisotdi-listing-${legacyMatch[1]}` : normalized;
}

/**
 * Resolves public aliases back to historical Firestore document IDs. New
 * OldiSotdi-native listing IDs pass through unchanged.
 */
export function toLegacyListingId(id: string): string {
  const normalized = String(id || '').trim();
  const demoMatch = PUBLIC_DEMO_ID.exec(normalized);
  if (demoMatch) return `olx-${demoMatch[1]}`;

  const legacyMatch = PUBLIC_LEGACY_ID.exec(normalized);
  return legacyMatch ? `olx-${legacyMatch[1]}` : normalized;
}

export function isLegacyDemoListingId(id: string): boolean {
  return LEGACY_DEMO_ID.test(String(id || '').trim());
}

export function isLegacyOlxListingId(id: string): boolean {
  return LEGACY_OLX_ID.test(String(id || '').trim());
}
