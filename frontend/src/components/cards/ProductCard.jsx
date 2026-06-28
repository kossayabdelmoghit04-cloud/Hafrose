import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

/**
 * Premium Product Card for luxury storefront
 * Memoized to prevent redundant renders under parent filter/search triggers.
 */
function ProductCard({ product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-white overflow-hidden border border-luxury-charcoal/5 hover:border-luxury-gold/20 transition-all duration-500"
    >
      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-luxury-light-gray block">
        <img
          src={getProductImage(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-luxury-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <span className="bg-luxury-cream text-luxury-charcoal font-sans text-[10px] tracking-[0.30em] uppercase py-2.5 px-6 shadow-md hover:bg-luxury-charcoal hover:text-luxury-cream transition-colors duration-300">
            Aperçu rapide
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-grow flex flex-col justify-between text-center bg-luxury-cream/20">
        <div className="space-y-1">
          {product.material && (
            <p className="text-[9px] tracking-widest uppercase text-luxury-gray font-sans font-light">
              {product.material}
            </p>
          )}
          <h3 className="font-serif text-sm font-light text-luxury-charcoal hover:text-luxury-gold transition-colors duration-300">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <div className="mt-3 pt-2 border-t border-luxury-charcoal/5">
          <p className="font-sans text-xs tracking-wider text-luxury-gold font-medium">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCard);
