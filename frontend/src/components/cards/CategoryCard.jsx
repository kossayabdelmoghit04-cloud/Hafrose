import { memo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

// Handle absolute or relative images outside component definition
const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=70&w=600';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `http://localhost:8000/storage/${img}`;
};

/**
 * Premium Category Card — Maison Hafrose Phase 4.3
 * Enhanced with Terre de Sienne (#8C6D58) accents, luxury hover motion & WCAG AA accessibility.
 */
function CategoryCard({ category, index }) {
  if (!category) return null;

  return (
    <Card
      as={Link}
      to={`/shop?category=${category.slug}`}
      variant="category"
      className="aspect-[4/5] w-full group relative overflow-hidden rounded-none border border-[var(--color-travertin)]/50 hover:border-[var(--color-sienne)]/70 transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sienne)] focus-visible:ring-offset-2"
      aria-label={`Découvrir la collection ${category.name}`}
    >
      <Card.Media ratio="auto" className="w-full h-full relative">
        {/* Background Image */}
        <Card.Image
          src={getImageUrl(category.image)}
          alt={category.name}
          zoom={true}
          className="w-full h-full object-cover object-center brightness-[0.78] group-hover:brightness-[0.62] group-hover:scale-105 transition-all duration-700 ease-out"
        />

        {/* Multi-layer Luxury Gradient Overlay with Terre de Sienne */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-encre)]/90 via-[var(--color-sienne)]/20 to-transparent transition-opacity duration-700 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Delicate inner frame accent */}
        <div
          className="absolute inset-4 border border-white/10 group-hover:border-[var(--color-sienne)]/40 transition-colors duration-700 pointer-events-none"
          aria-hidden="true"
        />

        {/* Text Details Overlay */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white z-10 space-y-2.5">
          {typeof index === 'number' && (
            <span
              className="text-[9px] tracking-[0.4em] text-[var(--color-sienne)] font-sans font-semibold block"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          )}

          <Card.Badge
            variant="featured"
            position="static"
            className="self-start text-[8px] tracking-[0.3em] uppercase bg-[var(--color-sienne)]/25 text-[var(--color-sable)] border-none px-2.5 py-1"
          >
            Collection
          </Card.Badge>

          <Card.Title as="h3" className="text-white text-xl md:text-2xl font-serif font-light tracking-wide">
            {category.name}
          </Card.Title>

          {category.description && (
            <Card.Description className="text-xs text-white/75 font-sans font-light line-clamp-2 max-w-xs transition-all duration-500 opacity-80 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0">
              {category.description}
            </Card.Description>
          )}
          
          {/* Terre de Sienne Accent Line & Action Indicator */}
          <div className="pt-2 flex items-center gap-3">
            <div 
              className="h-[1px] bg-[var(--color-sienne)] w-8 group-hover:w-14 transition-all duration-500" 
              aria-hidden="true"
            />
            <span className="text-[9px] tracking-[0.35em] uppercase text-[var(--color-sable)] group-hover:text-[var(--color-sienne)] font-sans font-medium transition-colors duration-300">
              Découvrir →
            </span>
          </div>
        </div>
      </Card.Media>
    </Card>
  );
}

export default memo(CategoryCard);
