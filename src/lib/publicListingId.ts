const LEGACY_DEMO_ID = /^olx-(\d+)$/i;
const PUBLIC_DEMO_ID = /^oldisotdi-demo-(\d+)$/i;

/**
 * Keeps legacy seeded Firestore document IDs private while exposing
 * OldiSotdi-branded URLs to users and crawlers.
 */
export function toPublicListingId(id: string): string {
  const normalized = String(id || '').trim();
  const match = LEGACY_DEMO_ID.exec(normalized);
  return match ? `oldisotdi-demo-${match[1]}` : normalized;
}

/**
 * Compatibility lookup for demo documents that were seeded before the
 * OldiSotdi rebrand. New/real listing IDs pass through unchanged.
 */
export function toLegacyListingId(id: string): string {
  const normalized = String(id || '').trim();
  const match = PUBLIC_DEMO_ID.exec(normalized);
  return match ? `olx-${match[1]}` : normalized;
}

export function isLegacyDemoListingId(id: string): boolean {
  return LEGACY_DEMO_ID.test(String(id || '').trim());
}
