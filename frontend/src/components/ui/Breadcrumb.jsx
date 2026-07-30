import { memo } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeJsonLd } from '../../utils/sanitizer';

/**
 * Breadcrumb — HAFROSE Design System
 * Navigation fil d'Ariane conforme WCAG 2.2 AA.
 * Schema.org BreadcrumbList intégré avec Trusted Types JSON-LD sanitization.
 *
 * @param {Array} items - Liste de { label: string, path?: string }
 */
const Breadcrumb = memo(function Breadcrumb({ items = [] }) {
  const allItems = [{ label: 'Accueil', path: '/' }, ...items];

  // Schema.org BreadcrumbList (SEO)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.path && { item: `https://hafrose.com${item.path}` }),
    })),
  };

  return (
    <>
      {/* Schema.org JSON-LD (Sanitized against script tag injection) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schemaData) }}
      />

      <nav
        className="breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <ol
          className="breadcrumb__list"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li
                key={item.label}
                className="breadcrumb__item"
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                {/* Séparateur */}
                {index > 0 && (
                  <span
                    className="breadcrumb__separator"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}

                {/* Lien ou texte courant */}
                {isLast ? (
                  <span
                    className="breadcrumb__current"
                    aria-current="page"
                    itemProp="name"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="breadcrumb__link"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
});

export default Breadcrumb;
