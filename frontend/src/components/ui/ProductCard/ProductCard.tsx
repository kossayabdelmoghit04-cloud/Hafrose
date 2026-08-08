import React, { memo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductCardProps } from './ProductCard.types';
import { Card } from '../Card';
import { IconButton } from '../IconButton';
import { Button } from '../Button';
import { LazyImage } from '../LazyImage';
import { formatPrice, getImageUrl } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

/**
 * ProductCard — HAFROSE UI Kit
 *
 * Optimized with:
 * - React.memo to prevent unnecessary re-renders in large grids
 * - LazyImage with native lazy loading + CLS-safe aspect ratio
 * - fetchPriority="high" disabled by default (only hero images use it)
 */
export const ProductCard: React.FC<ProductCardProps> = memo(({
  id,
  name,
  slug,
  price,
  salePrice,
  imageUrl,
  categoryName,
  badgeText,
  isWishlisted = false,
  onWishlistToggle,
  onQuickAdd,
  onClick,
  className,
}) => {
  const formattedPrice = formatPrice(price);
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;
  const imageSrc = getImageUrl(imageUrl);

  return (
    <Card
      hoverEffect
      className={cn('group flex flex-col cursor-pointer bg-white border-neutral-200/60', className)}
      onClick={() => onClick?.(slug)}
    >
      {/* 3:4 Aspect Ratio Image Container */}
      <div className="relative aspect-[3/4] w-full bg-cream-200 overflow-hidden">
        <LazyImage
          src={imageSrc}
          alt={name}
          className="w-full h-full transition-transform duration-500 ease-luxury group-hover:scale-105"
          wrapperClassName="w-full h-full"
          objectFit="cover"
        />

        {/* Badge Slot */}
        {badgeText && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-xs text-badge font-sans font-semibold tracking-wider uppercase bg-burgundy-50 text-burgundy-700 border border-burgundy-100 shadow-hafrose-xs">
              {badgeText}
            </span>
          </div>
        )}

        {/* Wishlist Button Overlay */}
        {onWishlistToggle && (
          <div className="absolute top-3 right-3 z-10">
            <IconButton
              variant="default"
              size="sm"
              aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(id);
              }}
              icon={
                <Heart
                  className={cn(
                    'w-4 h-4 transition-colors duration-200',
                    isWishlisted
                      ? 'text-burgundy-500 fill-burgundy-500'
                      : 'text-neutral-600 group-hover/btn:text-burgundy-500'
                  )}
                  aria-hidden="true"
                />
              }
            />
          </div>
        )}

        {/* Quick Add Overlay Button (Appears on Hover) */}
        {onQuickAdd && (
          <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-luxury">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={<ShoppingBag className="w-4 h-4" aria-hidden="true" />}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(id);
              }}
            >
              Ajout Rapide
            </Button>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
        <div>
          {categoryName && (
            <span className="text-caption font-medium tracking-wider uppercase text-neutral-500 block mb-1">
              {categoryName}
            </span>
          )}
          <h3 className="font-serif text-h5 text-neutral-900 line-clamp-1 group-hover:text-burgundy-500 transition-colors duration-200">
            {name}
          </h3>
        </div>

        {/* Price Block */}
        <div className="flex items-baseline gap-2 pt-1" aria-label={`Prix: ${formattedSalePrice ?? formattedPrice}`}>
          {formattedSalePrice ? (
            <>
              <span className="font-sans font-semibold text-body-base text-burgundy-600">
                {formattedSalePrice}
              </span>
              <span className="font-sans text-body-sm text-neutral-400 line-through" aria-label={`Ancien prix: ${formattedPrice}`}>
                {formattedPrice}
              </span>
            </>
          ) : (
            <span className="font-sans font-semibold text-body-base text-neutral-900">
              {formattedPrice}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
