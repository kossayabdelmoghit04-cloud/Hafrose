import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { LazyImageProps } from './LazyImage.types';

const DEFAULT_FALLBACK = '/assets/images/placeholder.webp';

/**
 * LazyImage — Production-ready image component for HAFROSE
 *
 * Features:
 * - Native lazy loading (`loading="lazy"`) by default
 * - `fetchpriority="high"` for above-the-fold images (`priority` prop)
 * - `decoding="async"` always enabled
 * - Graceful fallback on error
 * - Smooth fade-in on load to prevent layout flash
 * - CLS prevention via intrinsic dimensions / aspect-ratio
 * - Accessible alt text enforcement
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  wrapperClassName,
  width,
  height,
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK,
  objectFit = 'cover',
  placeholderColor = '#F5EFEB', // cream-ivory from Design System
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  React.useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  }, [hasError, currentSrc, fallbackSrc]);

  const aspectStyle =
    width && height ? { aspectRatio: `${width} / ${height}` } : undefined;

  return (
    <div
      className={cn('overflow-hidden relative', wrapperClassName)}
      style={{ backgroundColor: !isLoaded ? placeholderColor : undefined, ...aspectStyle }}
      onClick={onClick}
    >
      {/* Placeholder shimmer while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
          aria-hidden="true"
        />
      )}

      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-500 ease-luxury',
          isLoaded ? 'opacity-100' : 'opacity-0',
          {
            'object-cover': objectFit === 'cover',
            'object-contain': objectFit === 'contain',
            'object-fill': objectFit === 'fill',
            'object-none': objectFit === 'none',
            'object-scale-down': objectFit === 'scale-down',
          },
          className
        )}
      />
    </div>
  );
};
