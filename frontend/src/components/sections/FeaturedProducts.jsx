import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../cards/ProductCard';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import productService from '../../services/productService';
import { scrollRevealProps, staggerContainer, fadeUp, revealLine } from '../../utils/motionConfig';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await productService.getAll({ is_featured: true, per_page: 4 });
        if (res?.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Impossible de charger les créations vedettes.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section
      className="py-28 bg-luxury-cream relative overflow-hidden"
      aria-label="Créations vedettes Hafrose"
    >
      {/* Subtle radial BG */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(245,230,232,0.5) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Section Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12)}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="space-y-4">
            <motion.span variants={fadeUp} className="text-overline block">
              Sélection d'Artisans
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-fluid-h2 text-luxury-charcoal font-extralight">
              Les Créations Vedettes
            </motion.h2>
            <motion.div
              variants={revealLine}
              className="h-[1px] bg-luxury-gold w-12"
            />
          </div>

          <motion.div variants={fadeUp} className="flex-shrink-0">
            <Button to="/shop" variant="text" className="group">
              <span>Voir toutes les créations</span>
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Products Display */}
        {isLoading ? (
          <Skeleton.ProductGrid limit={4} />
        ) : error || products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs font-sans text-luxury-gray font-light tracking-wide">
              {error || 'Aucune création vedette disponible pour le moment.'}
            </p>
          </div>
        ) : (
          <motion.div
            {...scrollRevealProps}
            variants={staggerContainer(0.1, 0.1)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}
