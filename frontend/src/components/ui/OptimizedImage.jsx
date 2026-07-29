import { useState } from 'react';

/**
 * Enterprise Production-Grade Optimized Image Component
 * Supports AVIF/WebP, Blur Skeletons, Lazy Loading, and Accessibility.
 */
export default function OptimizedImage({
  src,
  alt = 'HAFROSE Product',
  width,
  height,
  className = '',
  priority = false,
  aspectRatio = 'aspect-square',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fallbackSrc = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=70',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const finalSrc = error ? fallbackSrc : (src || fallbackSrc);

  // Generate AVIF and WebP auto-format query strings for Unsplash or generic image sources
  const getFormatUrl = (url, format) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('unsplash.com')) {
      const cleanUrl = url.replace(/fm=[^&]+/, '');
      return `${cleanUrl}&fm=${format}`;
    }
    return url;
  };

  const avifSrc = getFormatUrl(finalSrc, 'avif');
  const webpSrc = getFormatUrl(finalSrc, 'webp');

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {/* Blur Skeleton Placeholder while image is downloading */}
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 bg-[var(--color-travertin)] animate-pulse transition-opacity duration-500"
          aria-hidden="true"
        />
      )}

      <picture>
        {/* AVIF Next-Gen Format */}
        <source srcSet={avifSrc} type="image/avif" sizes={sizes} />
        {/* WebP Fallback Format */}
        <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
        {/* Standard Format */}
        <img
          src={finalSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          {...props}
        />
      </picture>
    </div>
  );
}
