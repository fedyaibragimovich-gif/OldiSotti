import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateListingMeta, injectListingMetaTags, resetMetaTags } from '../src/utils/metaTags.ts';

const sampleListing = {
  id: 'test-101',
  title: 'iPhone 15 Pro Max 256GB Natural Titanium',
  description: 'Holati yangidek, karobka-dokument bor, batareya 99%.',
  categoryId: 'cat-electronics',
  price: 1100,
  currency: 'USD',
  condition: 'used',
  location: {
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani'
  },
  images: [
    'https://example.com/iphone-front.jpg',
    'https://example.com/iphone-back.jpg'
  ],
  createdAt: 'Bugun, 10:00',
  viewsCount: 150,
  seller: {
    id: 'seller-99',
    name: 'Dilshod',
    rating: 4.9,
    phone: '+998 90 123 45 67',
    joinedDate: '2024'
  }
};

test('generateListingMeta creates formatted title, description, and canonical /l/ url', () => {
  const meta = generateListingMeta(sampleListing, { baseUrl: 'https://oldisotdi.uz' });
  assert.ok(meta.title.includes('iPhone 15 Pro Max'));
  assert.ok(meta.title.includes('1,100') || meta.title.includes('1 100'));
  assert.ok(meta.title.endsWith('OldiSotdi'));
  assert.equal(meta.url, 'https://oldisotdi.uz/l/test-101');
  assert.equal(meta.image, 'https://example.com/iphone-front.jpg');
  assert.ok(meta.description.includes('Yunusobod tumani'));
  assert.ok(meta.description.includes('Holati yangidek'));
});

test('legacy seeded IDs are never exposed by listing metadata', () => {
  const meta = generateListingMeta({ ...sampleListing, id: 'olx-42' }, { baseUrl: 'https://oldisotdi.uz/' });
  assert.equal(meta.url, 'https://oldisotdi.uz/l/oldisotdi-demo-42');
  assert.equal(meta.url.includes('olx-'), false);
});

test('generateListingMeta falls back to high quality default image when images array is empty', () => {
  const noImageListing = { ...sampleListing, images: [] };
  const meta = generateListingMeta(noImageListing);
  assert.ok(meta.image.startsWith('https://images.unsplash.com/'));
});

test('injectListingMetaTags modifies document head and resetMetaTags restores defaults', () => {
  const metaMap = new Map();
  const createdElements = [];

  class MockMetaElement {
    constructor(attr, key, content = '') {
      this.attrs = { [attr]: key, content };
    }
    getAttribute(name) { return this.attrs[name] || null; }
    setAttribute(name, val) { this.attrs[name] = val; }
    remove() {}
  }

  const head = {
    appendChild: (el) => createdElements.push(el),
    removeChild: () => {}
  };

  const defaultMeta = [
    new MockMetaElement('name', 'description', 'Default portal description'),
    new MockMetaElement('property', 'og:title', 'OldiSotdi - O\'zbekiston e\'lonlar doskasi'),
    new MockMetaElement('property', 'og:image', 'https://oldisotdi.uz/default.jpg')
  ];

  defaultMeta.forEach(m => {
    if (m.attrs.name) metaMap.set(`name:${m.attrs.name}`, m);
    if (m.attrs.property) metaMap.set(`property:${m.attrs.property}`, m);
  });

  const canonicalLink = {
    getAttribute: (name) => name === 'href' ? 'https://oldisotdi.uz/' : null,
    setAttribute: (name, val) => { canonicalLink.href = val; },
    href: 'https://oldisotdi.uz/'
  };

  globalThis.document = {
    title: "OldiSotdi - O'zbekiston e'lonlar doskasi",
    head,
    querySelectorAll: (selector) => {
      if (selector.includes('meta')) return defaultMeta;
      return [];
    },
    querySelector: (selector) => {
      if (selector === 'link[rel="canonical"]') return canonicalLink;
      const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
      if (match) {
        const key = `${match[1]}:${match[2]}`;
        return metaMap.get(key) || null;
      }
      return null;
    },
    createElement: (tag) => {
      if (tag === 'meta') {
        const el = new MockMetaElement('', '');
        return {
          setAttribute: (k, v) => {
            el.setAttribute(k, v);
            if (k === 'name') metaMap.set(`name:${v}`, el);
            if (k === 'property') metaMap.set(`property:${v}`, el);
          },
          getAttribute: (k) => el.getAttribute(k)
        };
      }
      return { setAttribute: () => {}, remove: () => {} };
    },
    getElementById: () => null
  };

  globalThis.window = {
    location: { origin: 'https://oldisotdi.uz', href: 'https://oldisotdi.uz/' }
  };

  injectListingMetaTags(sampleListing, { currency: 'USD', lang: 'uz', baseUrl: 'https://oldisotdi.uz' });

  assert.ok(document.title.includes('iPhone 15 Pro Max'));
  const ogTitle = document.querySelector('meta[property="og:title"]');
  assert.ok(ogTitle.getAttribute('content').includes('iPhone 15 Pro Max'));
  const ogImage = document.querySelector('meta[property="og:image"]');
  assert.equal(ogImage.getAttribute('content'), 'https://example.com/iphone-front.jpg');
  assert.equal(canonicalLink.href, 'https://oldisotdi.uz/l/test-101');

  resetMetaTags();

  assert.equal(document.title, "OldiSotdi - O'zbekiston e'lonlar doskasi");
  assert.equal(canonicalLink.href, 'https://oldisotdi.uz/');
  assert.equal(ogTitle.getAttribute('content'), "OldiSotdi - O'zbekiston e'lonlar doskasi");
  assert.equal(ogImage.getAttribute('content'), 'https://oldisotdi.uz/default.jpg');
});
