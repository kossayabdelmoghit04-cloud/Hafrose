import { useEffect } from 'react';

const SITE_NAME = 'Hafrose';
const SITE_TITLE = "Hafrose — Haute Maroquinerie d'Exception";
const SITE_URL = 'https://hafrose.com';
const DEFAULT_OG_IMAGE = 'https://hafrose.com/og-default.jpg';

/**
 * Sets or creates a <meta> tag in <head>.
 * @param {string} selector - CSS selector (e.g. 'meta[name="description"]')
 * @param {string} attr     - Attribute to set (e.g. 'content')
 * @param {string} value    - Value to set
 * @param {Object} attrs    - Initial attributes when creating the element
 */
function setMeta(selector, attr, value, attrs = {}) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Sets or creates a <link> tag in <head>.
 * @param {string} rel   - Relation (e.g. 'canonical')
 * @param {string} href  - URL value
 */
function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Injects or updates a JSON-LD <script> block in <head>.
 * @param {string} id     - Unique ID for the script tag
 * @param {Object} schema - JSON-LD object
 */
function setJsonLd(id, schema) {
  if (!schema) return;
  const dataId = `jsonld-${id}`;
  let el = document.getElementById(dataId);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('id', dataId);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema, null, 0);
}

/**
 * Removes a JSON-LD <script> block from <head>.
 * @param {string} id - Unique ID for the script tag
 */
function removeJsonLd(id) {
  const el = document.getElementById(`jsonld-${id}`);
  if (el) el.remove();
}

/**
 * Central SEO hook for HAFROSE.
 *
 * @param {Object} options
 * @param {string}  options.title        - Page-specific title segment (appended with site name)
 * @param {string}  options.description  - Meta description (max ~160 chars)
 * @param {string}  [options.robots]     - Robots directive (default: 'index, follow')
 * @param {string}  [options.canonical]  - Canonical URL (default: current URL)
 * @param {string}  [options.ogType]     - Open Graph type (default: 'website')
 * @param {string}  [options.ogImage]    - Open Graph image URL
 * @param {Object}  [options.schema]     - JSON-LD schema object or array of objects
 */
export default function useSEO({
  title,
  description,
  robots = 'index, follow',
  canonical,
  ogType = 'website',
  ogImage,
  schema,
} = {}) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    document.title = title
      ? `${title} | ${SITE_NAME} — Haute Maroquinerie d'Exception`
      : SITE_TITLE;

    // ── Meta description ───────────────────────────────────────────────────
    setMeta('meta[name="description"]', 'content', description, {
      name: 'description',
    });

    // ── Robots ─────────────────────────────────────────────────────────────
    setMeta('meta[name="robots"]', 'content', robots, { name: 'robots' });

    // ── Canonical ──────────────────────────────────────────────────────────
    const canonicalUrl =
      canonical || `${SITE_URL}${window.location.pathname}`;
    setLink('canonical', canonicalUrl);

    // ── Open Graph ─────────────────────────────────────────────────────────
    const ogTitle = title
      ? `${title} | ${SITE_NAME}`
      : SITE_TITLE;
    setMeta('meta[property="og:title"]', 'content', ogTitle, {
      property: 'og:title',
    });
    setMeta('meta[property="og:description"]', 'content', description, {
      property: 'og:description',
    });
    setMeta('meta[property="og:type"]', 'content', ogType, {
      property: 'og:type',
    });
    setMeta('meta[property="og:url"]', 'content', canonicalUrl, {
      property: 'og:url',
    });
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME, {
      property: 'og:site_name',
    });
    setMeta(
      'meta[property="og:image"]',
      'content',
      ogImage || DEFAULT_OG_IMAGE,
      { property: 'og:image' }
    );
    setMeta('meta[property="og:locale"]', 'content', 'fr_FR', {
      property: 'og:locale',
    });

    // ── Twitter Cards ──────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image', {
      name: 'twitter:card',
    });
    setMeta('meta[name="twitter:title"]', 'content', ogTitle, {
      name: 'twitter:title',
    });
    setMeta('meta[name="twitter:description"]', 'content', description, {
      name: 'twitter:description',
    });
    setMeta(
      'meta[name="twitter:image"]',
      'content',
      ogImage || DEFAULT_OG_IMAGE,
      { name: 'twitter:image' }
    );

    // ── JSON-LD Schema.org ─────────────────────────────────────────────────
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((s, i) => {
        const id = s['@type']
          ? `${s['@type'].toLowerCase()}-${i}`
          : `schema-${i}`;
        setJsonLd(id, s);
      });
    }

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      if (schema) {
        const schemas = Array.isArray(schema) ? schema : [schema];
        schemas.forEach((s, i) => {
          const id = s['@type']
            ? `${s['@type'].toLowerCase()}-${i}`
            : `schema-${i}`;
          removeJsonLd(id);
        });
      }
    };
  }, [title, description, robots, canonical, ogType, ogImage, schema]);
}
