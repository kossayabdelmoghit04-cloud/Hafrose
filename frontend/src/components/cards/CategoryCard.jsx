import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Handle absolute or relative images outside component definition to avoid function re-creation
const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `http://localhost:8000/storage/${img}`;
};

/**
 * Premium Category Card
 * Memoized to prevent redundant renders when parent elements trigger state changes.
 */
function CategoryCard({ category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group relative aspect-[4/5] bg-luxury-light-gray overflow-hidden cursor-pointer border border-luxury-charcoal/5"
    >
      <Link to={`/shop?category=${category.slug}`} className="w-full h-full block">
        {/* Background Image */}
        <img
          src={getImageUrl(category.image)}
          alt={category.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/70 via-luxury-charcoal/20 to-transparent transition-opacity duration-500" />

        {/* Text Details Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
          <span className="text-[9px] tracking-[0.4em] uppercase text-luxury-gold font-sans font-semibold">
            Collection
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-light tracking-wide">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-[10px] text-white/70 font-sans font-light line-clamp-2 max-w-xs transition-opacity duration-500 opacity-0 group-hover:opacity-100">
              {category.description}
            </p>
          )}
          
          {/* Subtle line indicator */}
          <div className="w-8 h-[1px] bg-luxury-gold group-hover:w-16 transition-all duration-500 mt-2" />
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(CategoryCard);
