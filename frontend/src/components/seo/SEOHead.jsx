import { useEffect } from 'react';

const DEFAULT = {
  siteName: 'Maison Hafrose',
  siteUrl: 'https://hafrose.com',
  locale: 'fr_FR',
  twitterHandle: '@hafrose',
  defaultImage: 'https://hafrose.com/og-default.jpg',
};

/**
 * HAFROSE — Dynamic SEO Head Manager (Phase 5.8)
 *
 * Injects dynamic meta tags, Open Graph, Twitter Cards, Canonical, and JSON-LD
 * structured data into the document <head> for each page/product.
 *
 * Usage:
 *   <SEOHead
 *     title="Product Name"
 *     description="Product description..."
 *     image="https://..."
 *     type="product"
 *     product={{ name, price, currency, availability, brand, sku }}
 *   />
 */
export default function SEOHead({
  title,
  description,
  image,
  canonical,
  type = 'website',
  noIndex = false,
  product = null,
  breadcrumbs = null,
}) {
  const fullTitle = title
    ? `${title} — ${DEFAULT.siteName}`
    : `${DEFAULT.siteName} — Haute Maroquinerie d'Exception`;

  const metaDescription = description ||
    "Maison Hafrose — Haute Maroquinerie, Joaillerie Fine et Horlogerie d'Exception. Découvrez nos créations artisanales façonnées avec des matières nobles.";

  const metaImage = image || DEFAULT.defaultImage;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : DEFAULT.siteUrl);

  useEffect(() => {
    // ── Title
    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [key, val] = selector.replace(/[\[\]]/g, '').split('=');
        el.setAttribute(key.trim(), val?.replace(/"/g, '') ?? '');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // ── Primary meta
    setMeta('meta[name="description"]', 'content', metaDescription);
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow');

    // ── Canonical
    setLink('canonical', canonicalUrl);

    // ── Open Graph
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', metaDescription);
    setMeta('meta[property="og:image"]', 'content', metaImage);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', type === 'product' ? 'product' : 'website');

    // ── Twitter Cards
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', metaDescription);
    setMeta('meta[name="twitter:image"]', 'content', metaImage);

    // ── JSON-LD injection
    const removeJsonLd = (id) => document.getElementById(id)?.remove();
    
    // Product structured data
    if (product) {
      removeJsonLd('jsonld-product');
      const script = document.createElement('script');
      script.id = 'jsonld-product';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description || metaDescription,
        image: metaImage,
        brand: { '@type': 'Brand', name: product.brand || DEFAULT.siteName },
        sku: product.sku || product.id,
        offers: {
          '@type': 'Offer',
          priceCurrency: product.currency || 'EUR',
          price: product.price,
          availability: product.availability === false
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: DEFAULT.siteName },
        },
      });
      document.head.appendChild(script);
    } else {
      removeJsonLd('jsonld-product');
    }

    // Breadcrumb structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      removeJsonLd('jsonld-breadcrumb');
      const script = document.createElement('script');
      script.id = 'jsonld-breadcrumb';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
          item: crumb.url,
        })),
      });
      document.head.appendChild(script);
    } else {
      removeJsonLd('jsonld-breadcrumb');
    }

    // Cleanup injected JSON-LD on unmount
    return () => {
      removeJsonLd('jsonld-product');
      removeJsonLd('jsonld-breadcrumb');
    };
  }, [fullTitle, metaDescription, metaImage, canonicalUrl, type, noIndex, product, breadcrumbs]);

  // No DOM output — this component only manages <head>
  return null;
}
