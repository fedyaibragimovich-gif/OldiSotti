// Preferences must never prevent the marketplace from rendering when storage is
// disabled or full. Account data continues to come from Firebase.
//
// The project historically used both `olx_*` and `oldisotti_*` keys. Keep those
// readable for one migration pass, but persist everything under the canonical
// `oldisotdi_*` namespace so new browser data carries only the OldiSotdi brand.
const CANONICAL_PREFIX = 'oldisotdi_';
const LEGACY_PREFIXES = ['olx_', 'oldisotti_'] as const;

function canonicalStorageKey(key: string): string {
  const normalized = String(key || '');
  for (const prefix of LEGACY_PREFIXES) {
    if (normalized.startsWith(prefix)) return `${CANONICAL_PREFIX}${normalized.slice(prefix.length)}`;
  }
  return normalized;
}

function legacyStorageKeys(canonicalKey: string): string[] {
  if (!canonicalKey.startsWith(CANONICAL_PREFIX)) return [];
  const suffix = canonicalKey.slice(CANONICAL_PREFIX.length);
  return LEGACY_PREFIXES.map((prefix) => `${prefix}${suffix}`);
}

export const browserStorage = {
  getItem(key: string): string | null {
    try {
      const canonicalKey = canonicalStorageKey(key);
      const current = window.localStorage.getItem(canonicalKey);
      if (current !== null) return current;

      for (const legacyKey of legacyStorageKeys(canonicalKey)) {
        const legacyValue = window.localStorage.getItem(legacyKey);
        if (legacyValue === null) continue;

        // Best-effort one-time migration. Reading still succeeds if storage is
        // read-only/full and the cleanup cannot be completed.
        try {
          window.localStorage.setItem(canonicalKey, legacyValue);
          window.localStorage.removeItem(legacyKey);
        } catch { /* Optional migration cache. */ }
        return legacyValue;
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      const canonicalKey = canonicalStorageKey(key);
      window.localStorage.setItem(canonicalKey, value);
      for (const legacyKey of legacyStorageKeys(canonicalKey)) {
        try { window.localStorage.removeItem(legacyKey); } catch { /* Optional cleanup. */ }
      }
    } catch { /* Optional cache. */ }
  },
  removeItem(key: string): void {
    try {
      const canonicalKey = canonicalStorageKey(key);
      window.localStorage.removeItem(canonicalKey);
      for (const legacyKey of legacyStorageKeys(canonicalKey)) {
        try { window.localStorage.removeItem(legacyKey); } catch { /* Optional cleanup. */ }
      }
    } catch { /* Optional cache. */ }
  },
};

export function readStoredIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(browserStorage.getItem(key) || '[]');
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))]
      : [];
  } catch { return []; }
}
