// Preferences must never prevent the marketplace from rendering when storage is
// disabled or full. Account data continues to come from Firebase.
export const browserStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string): void {
    try { window.localStorage.setItem(key, value); } catch { /* Optional cache. */ }
  },
  removeItem(key: string): void {
    try { window.localStorage.removeItem(key); } catch { /* Optional cache. */ }
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
