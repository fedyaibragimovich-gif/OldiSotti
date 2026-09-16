import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { translations } from './data/translations.ts';
import { mockListings } from './data/mockListings.ts';
import { toLegacyListingId, toPublicListingId } from './lib/publicListingId.ts';
import { initializeProductionMonitoring } from './lib/monitoring.ts';
import { syncSiteOriginMetadata } from './lib/siteMetadata.ts';
import './index.css';
import './performance.css';

// Demo inventory is useful in local development, but must never be presented as
// real marketplace inventory when production Firestore is empty or unavailable.
if (import.meta.env.PROD) {
  mockListings.splice(0, mockListings.length);
}

// Keep user-facing copy consistently branded as OldiSotdi while legacy
// translation keys/storage identifiers remain compatible for existing users.
const localizedCopy = translations as unknown as Record<string, Record<string, unknown>>;
for (const locale of Object.values(localizedCopy)) {
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === 'string') {
      locale[key] = value.replace(/Oldisotti/g, 'OldiSotdi').replace(/OldiSotti/g, 'OldiSotdi');
    }
  }
}

let pendingDeepLinkListingId: string | null = null;

if (typeof window !== 'undefined') {
  if (import.meta.env.PROD) initializeProductionMonitoring();

  const nativeReplaceState = window.history.replaceState.bind(window.history);
  const listingPathPattern = /^\/l\/([^/]+)\/?$/i;

  const normalizePublicListingUrl = (url: URL, rawListingId: string) => {
    const publicId = toPublicListingId(toLegacyListingId(rawListingId));
    url.pathname = `/l/${encodeURIComponent(publicId)}`;
    url.searchParams.delete('listing');
    return url;
  };

  // Resolve both the new /l/<id> format and older ?listing=<id> deep links.
  // Firestore may still contain pre-rebrand demo document IDs, so only the
  // internal event receives the legacy ID; the address bar remains OldiSotdi-branded.
  try {
    const initialUrl = new URL(window.location.href);
    const pathMatch = initialUrl.pathname.match(listingPathPattern);
    const rawListingId = pathMatch
      ? decodeURIComponent(pathMatch[1])
      : initialUrl.searchParams.get('listing');

    if (rawListingId) {
      pendingDeepLinkListingId = toLegacyListingId(rawListingId);
      const normalizedUrl = normalizePublicListingUrl(initialUrl, rawListingId);
      nativeReplaceState(window.history.state, '', normalizedUrl);
    }
  } catch {
    pendingDeepLinkListingId = null;
  }

  // Canonical, hreflang, OpenGraph URL and WebSite JSON-LD must follow whichever
  // production hostname is serving the app. This makes a future custom domain
  // SEO-safe immediately instead of leaving old vercel.app canonicals behind.
  syncSiteOriginMetadata();

  // App.tsx historically writes ?listing=<internal-id> when a card is opened.
  // Transparently convert that navigation to /l/<public-id> without changing
  // the listing object used by Firestore, favorites, chat, or moderation.
  window.history.replaceState = ((data: unknown, unused: string, url?: string | URL | null) => {
    if (url !== undefined && url !== null) {
      try {
        const nextUrl = new URL(String(url), window.location.href);
        const rawListingId = nextUrl.searchParams.get('listing');
        if (rawListingId) {
          return nativeReplaceState(data, unused, normalizePublicListingUrl(nextUrl, rawListingId));
        }
      } catch {
        // Fall through to the native implementation for malformed third-party URLs.
      }
    }
    return nativeReplaceState(data, unused, url);
  }) as History['replaceState'];

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('OldiSotdi service worker registration failed:', error);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

if (typeof window !== 'undefined') {
  // The app already exposes a safe deep-link event that fetches one listing by
  // document ID. Retry briefly because React effects register the listener after render.
  if (pendingDeepLinkListingId) {
    const internalId = pendingDeepLinkListingId;
    let attempt = 0;
    const openDeepLinkedListing = () => {
      if (document.getElementById(`price-alert-card-${internalId}`)) return;
      window.dispatchEvent(new CustomEvent<string>('oldisotti_open_listing', { detail: internalId }));
      attempt += 1;
      if (attempt < 8) window.setTimeout(openDeepLinkedListing, Math.min(250 + attempt * 250, 1500));
    };
    window.setTimeout(openDeepLinkedListing, 250);
  }

  // Keep the public /l/<id> URL only while a listing modal is open. This
  // observer watches structural changes only; unlike the previous compatibility
  // shim it never scans/re-writes all text nodes in the document.
  let hadListingModal = false;
  const appRoot = document.getElementById('root');
  if (appRoot) {
    const observer = new MutationObserver(() => {
      const listingModalOpen = Boolean(document.querySelector('[id^="price-alert-card-"]'));
      if (listingModalOpen) {
        hadListingModal = true;
        return;
      }

      if (hadListingModal && /^\/l\//i.test(window.location.pathname)) {
        const homeUrl = new URL(window.location.href);
        homeUrl.pathname = '/';
        homeUrl.searchParams.delete('listing');
        window.history.replaceState(window.history.state, '', homeUrl);
        syncSiteOriginMetadata();
        hadListingModal = false;
      }
    });

    observer.observe(appRoot, { childList: true, subtree: true });
  }
}
