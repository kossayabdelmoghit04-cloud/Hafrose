/**
 * HAFROSE SEO Utilities
 *
 * Provides typed helpers to build <meta> tags, Open Graph data,
 * Twitter Card data, and JSON-LD structured data payloads.
 *
 * All values respect HAFROSE brand identity.
 */

export const SITE_NAME = 'HAFROSE';
export const SITE_URL = import.meta.env.VITE_APP_URL || 'https://hafrose.com';
export const SITE_DESCRIPTION =
  'HAFROSE — Maison de mode féminine de luxe. Découvrez des collections exclusives alliant élégance, raffinement et artisanat d\'exception.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
export const BRAND_COLOR = '#8A1538';

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */

export interface SEOMeta {
  title: string;
  description?: string;
  /** Canonical URL — defaults to current path */
  canonical?: string;
  /** OG image URL */
  ogImage?: string;
  /** Set true for private/transactional pages */
  noIndex?: boolean;
  /** Open Graph type */
  ogType?: 'website' | 'article' | 'product';
}

/* ─────────────────────────────────────────────────────────────
   JSON-LD Builders
   ───────────────────────────────────────────────────────────── */

/** Organization JSON-LD — placed on home/about pages */
export function buildOrganizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [
      'https://www.instagram.com/hafrose',
      'https://www.facebook.com/hafrose',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['French', 'Arabic'],
    },
  };
}

/** WebSite + Sitelinks Searchbox JSON-LD */
export function buildWebSiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Product JSON-LD for Product Detail pages */
export function buildProductLD(product: {
  name: string;
  description?: string;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  slug: string;
  sku?: string;
  inStock?: boolean;
}) {
  const price = product.salePrice ?? product.price;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    sku: product.sku,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'DZD',
      price: price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.slug}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

/** BreadcrumbList JSON-LD */
export function buildBreadcrumbLD(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** ItemList JSON-LD for collection / shop pages */
export function buildItemListLD(
  items: Array<{ name: string; url: string; imageUrl?: string | null }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** Helper: serialize JSON-LD to a script tag string (for innerHTML) */
export function serializeLD(data: object): string {
  return JSON.stringify(data);
}
