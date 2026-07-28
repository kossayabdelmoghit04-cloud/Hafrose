import { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProductCard from '../cards/ProductCard';

/**
 * ProductRecommendations — HAFROSE Design System Phase 3
 * Section "Créations Similaires" et "Vus Récemment".
 * Réutilise ProductCard existant. Scroll horizontal sur mobile.
 */

const RECENTLY_VIEWED_KEY = 'hafrose_recently_viewed';
const MAX_RECENTLY = 6;

/* ── Utility: Recently Viewed ─────────────────────────────────────── */
export function trackProductView(product) {
  if (!product?.id) return;
  try {
    const existing = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [{ id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images }, ...filtered].slice(0, MAX_RECENTLY);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch { /* silent */ }
}

export function getRecentlyViewed(excludeId) {
  try {
    const items = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    return items.filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}

/* ── Horizontal Scroll Section ────────────────────────────────────── */
function HorizontalSection({ title, link, linkLabel, products }) {
  const trackRef = useRef(null);

  if (!products?.length) return null;

  return (
    <section className="mt-20 border-t border-beige pt-16" aria-label={title}>
      {/* Header */}
      <div className="flex items-end justify-between mb-10 px-0">
        <h2 className="font-serif text-2xl font-light text-luxury-charcoal">
          {title}
        </h2>
        {link && (
          <Link
            to={link}
            className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-rose-gold transition-colors"
          >
            {linkLabel || 'Voir tout'}
            <FiArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Grid — 4 cols desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
const ProductRecommendations = memo(function ProductRecommendations({
  similar = [],
  recentlyViewed = [],
}) {
  const hasSimilar = similar.length > 0;
  const hasRecent = recentlyViewed.length > 0;

  if (!hasSimilar && !hasRecent) return null;

  return (
    <>
      {hasSimilar && (
        <HorizontalSection
          title="Créations Similaires"
          link="/shop"
          linkLabel="Voir la Boutique"
          products={similar}
        />
      )}

      {hasRecent && (
        <HorizontalSection
          title="Vus Récemment"
          link="/shop"
          linkLabel="Voir tout"
          products={recentlyViewed}
        />
      )}
    </>
  );
});

export default ProductRecommendations;
