export interface SiteUrls {
  canonical: string;
  uz: string;
  ru: string;
  xDefault: string;
}

export function buildSiteUrls(origin: string, pathname = '/'): SiteUrls {
  const cleanOrigin = origin.replace(/\/$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonical = `${cleanOrigin}${cleanPath}`;
  return {
    canonical,
    uz: canonical,
    ru: `${canonical}${canonical.includes('?') ? '&' : '?'}lang=ru`,
    xDefault: canonical
  };
}

function setMeta(selector: string, attribute: 'content' | 'href', value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

export function syncSiteOriginMetadata(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const urls = buildSiteUrls(window.location.origin, window.location.pathname || '/');
  setMeta('link[rel="canonical"]', 'href', urls.canonical);
  setMeta('link[rel="alternate"][hreflang="uz"]', 'href', urls.uz);
  setMeta('link[rel="alternate"][hreflang="ru"]', 'href', urls.ru);
  setMeta('link[rel="alternate"][hreflang="x-default"]', 'href', urls.xDefault);
  setMeta('meta[property="og:url"]', 'content', urls.canonical);
  setMeta('meta[name="twitter:url"]', 'content', urls.canonical);

  const schema = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!schema?.textContent) return;
  try {
    const data = JSON.parse(schema.textContent);
    if (data && data['@type'] === 'WebSite') {
      data.url = `${window.location.origin.replace(/\/$/, '')}/`;
      if (data.potentialAction?.target) {
        data.potentialAction.target = `${window.location.origin.replace(/\/$/, '')}/?q={search_term_string}`;
      }
      schema.textContent = JSON.stringify(data);
    }
  } catch {
    // Static fallback metadata remains valid if JSON-LD cannot be parsed.
  }
}
