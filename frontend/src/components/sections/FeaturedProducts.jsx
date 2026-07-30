import { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ProductCard from '../cards/ProductCard';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import productService from '../../services/productService';
import { scrollRevealProps, fadeUp, revealLine } from '../../utils/motionConfig';

/* ─────────────────────────────────────────────────────────────
   Local animation variants for Featured Products
───────────────────────────────────────────────────────────── */
const headerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardItemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const fetchFeatured = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await productService.getAll({ is_featured: true, per_page: 4 });
      if (res?.success && Array.isArray(res.data?.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Impossible de charger les créations vedettes pour le moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return (
    <section
      id="featured-products"
      className="featured-section relative overflow-hidden bg-luxury-cream py-28 md:py-36"
      aria-label="Créations vedettes Maison Hafrose"
    >
      {/* ── Subtle Ambient Backdrop Lighting ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(140, 109, 88, 0.06) 0%, transparent 75%)',
        }}
      />

      {/* Decorative background accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* ── Editorial Header ── */}
        <motion.div
          {...scrollRevealProps}
          variants={headerStagger}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-20 gap-8"
        >
          <div className="space-y-4 max-w-2xl">
            {/* Eyebrow badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3">
              <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
              <span className="text-overline text-luxury-bronze">Sélection d'Artisans</span>
              <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={fadeUp}
              className="text-fluid-h2 text-luxury-charcoal font-serif font-extralight tracking-tight"
            >
              Les Créations Vedettes
            </motion.h2>

            {/* Gold divider */}
            <motion.div
              variants={revealLine}
              className="h-[1px] bg-gradient-to-r from-luxury-gold via-luxury-gold/60 to-transparent w-16"
              aria-hidden="true"
            />

            {/* Editorial Subline */}
            <motion.p
              variants={fadeUp}
              className="text-editorial text-luxury-gray text-base md:text-lg max-w-xl font-light leading-relaxed"
            >
              Une sélection exclusive de nos pièces d'exception, façonnées à la main par nos maîtres artisans avec des cuirs nobles.
            </motion.p>
          </div>

          {/* Action CTA */}
          <motion.div variants={fadeUp} className="flex-shrink-0 pt-2 lg:pt-0">
            <Button
              to="/shop"
              variant="text"
              className="group text-luxury-charcoal hover:text-luxury-gold font-sans text-xs tracking-[0.25em] uppercase font-medium transition-colors duration-300"
              aria-label="Voir toutes les créations de la boutique"
            >
              <span>Voir toutes les créations</span>
              <motion.span
                className="ml-2 inline-block font-normal"
                animate={shouldReduceMotion ? {} : { x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                →
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Products Display Grid ── */}
        {isLoading ? (
          <div aria-busy="true" aria-label="Chargement des créations vedettes">
            <Skeleton.ProductGrid limit={4} className="gap-8 lg:gap-10" />
          </div>
        ) : error || products.length === 0 ? (
          <div className="py-20 text-center border border-luxury-gold/15 bg-luxury-cream/40 p-8">
            <p className="text-xs font-sans text-luxury-gray font-light tracking-wider uppercase mb-4">
              {error || 'Aucune création vedette disponible pour le moment.'}
            </p>
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFeatured}
                className="mt-2 text-xs"
              >
                Réessayer
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            {...scrollRevealProps}
            variants={cardStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
            role="list"
            aria-label="Liste des créations vedettes"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={cardItemVariant}
                role="listitem"
                className="h-full flex"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Decorative bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/15 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
