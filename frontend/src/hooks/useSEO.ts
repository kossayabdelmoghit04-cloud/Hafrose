import { useEffect, useRef } from 'react';
import {
  SEOMeta,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from '../utils/seo';

/**
 * useSEO — Dynamic document head manager
 *
 * Injects / updates meta tags on mount and reverts to defaults on unmount.
 * No external library dependency — pure DOM manipulation.
 *
 * Usage:
 *   useSEO({ title: 'Shop | HAFROSE', description: '...', ogType: 'website' });
 */
export function useSEO(meta: SEOMeta): void {
  const previousTitle = useRef(document.title);

  useEffect(() => {
    const fullTitle = meta.title.includes(SITE_NAME)
      ? meta.title
      : `${meta.title} | ${SITE_NAME}`;

    const description = meta.description ?? SITE_DESCRIPTION;
    const ogImage = meta.ogImage ?? DEFAULT_OG_IMAGE;
    const canonical = meta.canonical ?? `${SITE_URL}${window.location.pathname}`;
    const ogType = meta.ogType ?? 'website';

    // ── Document Title ─────────────────────────────────────────
    previousTitle.current = document.title;
    document.title = fullTitle;

    // ── Helper to upsert a <meta> tag ─────────────────────────
    const upsertMeta = (
      attrKey: 'name' | 'property',
      attrValue: string,
      content: string
    ) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attrKey}="${attrValue}"]`
      );
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrKey, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return el;
    };

    // ── Helper to upsert a <link> tag ─────────────────────────
    const upsertLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      return el;
    };

    // ── Standard Meta ─────────────────────────────────────────
    upsertMeta('name', 'description', description);

    // ── Robots ────────────────────────────────────────────────
    upsertMeta('name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow');

    // ── Canonical ─────────────────────────────────────────────
    upsertLink('canonical', canonical);

    // ── Open Graph ────────────────────────────────────────────
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'fr_FR');

    // ── Twitter Card ─────────────────────────────────────────
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

    // ── Cleanup: restore previous title on unmount ────────────
    return () => {
      document.title = previousTitle.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description, meta.ogImage, meta.canonical, meta.noIndex, meta.ogType]);
}

/**
 * useJsonLD — Injects a JSON-LD <script> into <head> and removes it on unmount
 */
export function useJsonLD(data: object | null): void {
  useEffect(() => {
    if (!data) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    script.id = `jsonld-${Math.random().toString(36).slice(2, 9)}`;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);
}
