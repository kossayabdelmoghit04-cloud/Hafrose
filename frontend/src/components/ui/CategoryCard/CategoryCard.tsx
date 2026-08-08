import React, { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { CategoryCardProps } from './CategoryCard.types';
import { LazyImage } from '../LazyImage';
import { getImageUrl } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const CategoryCard: React.FC<CategoryCardProps> = memo(({
  name,
  slug,
  imageUrl,
  productCount,
  onClick,
  className,
}) => {
  const imageSrc = getImageUrl(imageUrl);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Découvrir la catégorie ${name}`}
      onClick={() => onClick?.(slug)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(slug)}
      className={cn(
        'group relative aspect-[3/4] w-full overflow-hidden rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Background Image */}
      <LazyImage
        src={imageSrc}
        alt={name}
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-luxury group-hover:scale-105"
        wrapperClassName="absolute inset-0 w-full h-full"
      />

      {/* Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/20 to-transparent transition-opacity duration-350 group-hover:opacity-90" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-0 transition-transform duration-350 ease-luxury">
        {productCount !== undefined && (
          <span className="text-caption font-sans font-medium tracking-luxury-wide uppercase text-white/70 mb-1 block">
            {productCount} articles
          </span>
        )}
        <div className="flex items-end justify-between gap-2">
          <h3 className="font-serif text-h4 text-white leading-tight group-hover:-translate-y-1 transition-transform duration-350 ease-luxury">
            {name}
          </h3>
          <ArrowRight className="w-5 h-5 text-white/80 flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-350 ease-luxury mb-1" />
        </div>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';
