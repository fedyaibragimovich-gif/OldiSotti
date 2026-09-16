import { useEffect } from 'react';
import type { Listing, Currency, Language } from '../types';
import { formatPrice } from './formatters.ts';
import { toPublicListingId } from '../lib/publicListingId.ts';

interface DefaultMetaSnapshot {
  title: string;
  canonical: string;
  meta: Map<string, string>;
}

const FALLBACK_PUBLIC_ORIGIN = 'https://fedyaibragimovich-gif.vercel.app';
let initialSnapshot: DefaultMetaSnapshot | null = null;

function getMetaKey(attr: 'name' | 'property', key: string): string {
  return `${attr}:${key}`;
}

function captureInitialSnapshot() {
  if (typeof document === 'undefined' || initialSnapshot) return;

  const metaMap = new Map<string, string>();
  const metaElements = document.querySelectorAll('meta[name], meta[property]');
  metaElements.forEach((el) => {
    const name = el.getAttribute('name');
    const property = el.getAttribute('property');
    const content = el.getAttribute('content') || '';
    if (name) metaMap.set(getMetaKey('name', name), content);
    if (property) metaMap.set(getMetaKey('property', property), content);
  });

  const canonicalEl = document.querySelector('link[rel="canonical"]');

  initialSnapshot = {
    title: document.title || "OldiSotdi - O'zbekiston e'lonlar doskasi",
    canonical: canonicalEl?.getAttribute('href') || `${FALLBACK_PUBLIC_ORIGIN}/`,
    meta: metaMap
  };
}

function setOrUpdateMetaTag(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;

  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOrUpdateCanonical(href: string) {
  if (typeof document === 'undefined') return;

  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function sanitizeText(text: string, maxLength = 200): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function generateListingMeta(
  listing: Listing,
  options?: { currency?: Currency; lang?: Language; baseUrl?: string }
) {
  const targetCurrency = options?.currency || listing.currency || 'UZS';
  const priceFormatted = formatPrice(listing.price, listing.currency, targetCurrency);

  const title = `${listing.title} — ${priceFormatted} | OldiSotdi`;

  const conditionLabel = listing.condition === 'new'
    ? (options?.lang === 'ru' ? 'Новый' : options?.lang === 'oz' ? 'Янги' : 'Yangi')
    : (options?.lang === 'ru' ? 'Б/у' : options?.lang === 'oz' ? 'Ишлатилган' : 'Ishlatilgan');

  const locationLabel = listing.location?.district
    ? `${listing.location.district}, ${listing.location.region || ''}`
    : listing.location?.region || 'O‘zbekiston';

  const descSnippet = sanitizeText(listing.description, 160);
  const fullDescription = `${priceFormatted} • ${conditionLabel} • ${locationLabel}. ${descSnippet}`;

  const defaultImage = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=630&q=80';
  let primaryImage = listing.images && listing.images.length > 0 ? listing.images[0] : defaultImage;

  const origin = (options?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : FALLBACK_PUBLIC_ORIGIN)).replace(/\/$/, '');

  if (primaryImage.startsWith('/')) {
    primaryImage = `${origin}${primaryImage}`;
  }

  const listingUrl = `${origin}/l/${encodeURIComponent(toPublicListingId(listing.id))}`;

  return {
    title,
    description: fullDescription,
    image: primaryImage,
    url: listingUrl,
    price: String(listing.price),
    currency: listing.currency || 'UZS',
    condition: conditionLabel
  };
}

/**
 * Dynamically injects OpenGraph, Twitter, and SEO metadata into document.head
 * when a user opens a specific listing.
 */
export function injectListingMetaTags(
  listing: Listing,
  options?: { currency?: Currency; lang?: Language; baseUrl?: string }
): void {
  if (typeof document === 'undefined' || !listing) return;

  captureInitialSnapshot();

  const meta = generateListingMeta(listing, options);

  document.title = meta.title;

  setOrUpdateMetaTag('name', 'title', meta.title);
  setOrUpdateMetaTag('name', 'description', meta.description);

  setOrUpdateMetaTag('property', 'og:type', 'product');
  setOrUpdateMetaTag('property', 'og:site_name', 'OldiSotdi');
  setOrUpdateMetaTag('property', 'og:url', meta.url);
  setOrUpdateMetaTag('property', 'og:title', meta.title);
  setOrUpdateMetaTag('property', 'og:description', meta.description);
  setOrUpdateMetaTag('property', 'og:image', meta.image);
  setOrUpdateMetaTag('property', 'og:image:secure_url', meta.image);
  setOrUpdateMetaTag('property', 'og:image:alt', listing.title);
  setOrUpdateMetaTag('property', 'og:image:width', '1200');
  setOrUpdateMetaTag('property', 'og:image:height', '630');
  setOrUpdateMetaTag('property', 'product:price:amount', meta.price);
  setOrUpdateMetaTag('property', 'product:price:currency', meta.currency);

  setOrUpdateMetaTag('name', 'twitter:card', 'summary_large_image');
  setOrUpdateMetaTag('name', 'twitter:url', meta.url);
  setOrUpdateMetaTag('name', 'twitter:title', meta.title);
  setOrUpdateMetaTag('name', 'twitter:description', meta.description);
  setOrUpdateMetaTag('name', 'twitter:image', meta.image);

  setOrUpdateCanonical(meta.url);

  try {
    let jsonLdScript = document.getElementById('listing-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'listing-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images && listing.images.length > 0 ? listing.images : [meta.image],
      offers: {
        '@type': 'Offer',
        price: meta.price,
        priceCurrency: meta.currency,
        availability: 'https://schema.org/InStock',
        url: meta.url
      }
    });
  } catch (err) {
    console.warn('Failed to inject JSON-LD structured data:', err);
  }
}

/**
 * Resets OpenGraph, Twitter, and document title to their original defaults
 * when the listing modal is closed.
 */
export function resetMetaTags(): void {
  if (typeof document === 'undefined') return;

  if (initialSnapshot) {
    document.title = initialSnapshot.title;
    setOrUpdateCanonical(initialSnapshot.canonical);

    initialSnapshot.meta.forEach((content, fullKey) => {
      const [attr, ...rest] = fullKey.split(':') as ['name' | 'property', string[]];
      const key = rest.join(':');
      setOrUpdateMetaTag(attr, key, content);
    });
  } else {
    document.title = "OldiSotdi - O'zbekiston e'lonlar doskasi";
    setOrUpdateCanonical(`${FALLBACK_PUBLIC_ORIGIN}/`);
  }

  const jsonLdScript = document.getElementById('listing-jsonld');
  if (jsonLdScript) {
    jsonLdScript.remove();
  }
}

/**
 * React Hook that automatically manages meta tags when a listing is opened or closed.
 */
export function useListingMetaTags(
  listing: Listing | null,
  options?: { currency?: Currency; lang?: Language }
) {
  useEffect(() => {
    if (listing) {
      injectListingMetaTags(listing, options);
    } else {
      resetMetaTags();
    }

    return () => {
      resetMetaTags();
    };
  }, [listing?.id, options?.currency, options?.lang]);
}
