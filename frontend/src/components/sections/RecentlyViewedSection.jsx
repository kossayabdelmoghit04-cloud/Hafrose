import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import ProductCard from '../cards/ProductCard';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const RecentlyViewedSection = memo(function RecentlyViewedSection({ currentProductId = null, title = "Continuer Vos Découvertes", subtitle = "Récemment consultés" }) {
  const { recentlyViewed, clearHistory } = useRecentlyViewed();

  // Filter out current product if on Product Detail Page
  const filtered = recentlyViewed.filter((item) => item.id !== currentProductId);

  if (filtered.length === 0) return null;

  return (
    <section
      className="py-24 bg-luxury-cream border-t border-luxury-gold/10 relative overflow-hidden"
      aria-label="Produits récemment consultés"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Section Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div className="space-y-3">
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-overline">
              <FiClock size={12} className="text-luxury-gold" />
              <span>{subtitle}</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-fluid-h2 text-luxury-charcoal font-extralight">
              {title}
            </motion.h2>
            <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold w-12" />
          </div>

          <motion.div variants={fadeUp}>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-gray hover:text-luxury-gold font-sans transition-colors"
              aria-label="Effacer l'historique de consultation"
            >
              <FiTrash2 size={12} />
              <span>Effacer l'historique</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.08)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {filtered.slice(0, 4).map((product) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
});

export default RecentlyViewedSection;
