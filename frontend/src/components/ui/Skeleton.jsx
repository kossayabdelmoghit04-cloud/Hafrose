import React, { memo } from 'react';

/**
 * Base Polymorphic Skeleton Primitive with gold/cream shimmer styling
 */
export const Skeleton = memo(({
  className = '',
  variant = 'rect', // 'rect' | 'circle' | 'text'
  width,
  height,
  ...props
}) => {
  const shapeClass = 
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-none h-3 my-1.5'
      : 'rounded-none';

  return (
    <div
      className={`skeleton-shimmer ${shapeClass} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';

/**
 * Skeleton Product Card matching Maison Hafrose card style
 */
export const SkeletonCard = memo(({ className = '', ...props }) => {
  return (
    <div 
      className={`border border-card-border-editorial bg-card-bg-primary flex flex-col h-full rounded-none overflow-hidden ${className}`.trim()}
      {...props}
    >
      {/* 3:4 Media Image area */}
      <div className="aspect-[3/4] w-full skeleton-shimmer border-b border-card-border-editorial" />
      
      {/* Info Body */}
      <div className="p-card-md text-center flex flex-col items-center gap-card-md">
        {/* Category meta */}
        <div className="w-20 h-2 skeleton-shimmer opacity-60" />
        
        {/* Title */}
        <div className="w-3/4 h-3.5 skeleton-shimmer" />
        
        {/* Footer info line */}
        <div className="w-full border-t border-card-border-editorial pt-3 flex justify-center gap-2">
          {/* Price */}
          <div className="w-12 h-3.5 skeleton-shimmer" />
          {/* Availability */}
          <div className="w-16 h-3.5 skeleton-shimmer opacity-85" />
        </div>
      </div>
    </div>
  );
});
SkeletonCard.displayName = 'Skeleton.Card';

/**
 * Skeleton Product Grid responsive layout
 */
export const SkeletonProductGrid = memo(({ limit = 8, className = '', ...props }) => {
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 ${className}`.trim()}
      {...props}
    >
      {Array.from({ length: limit }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
});
SkeletonProductGrid.displayName = 'Skeleton.ProductGrid';

/**
 * Skeleton Table header & body matching luxury table structure
 */
export const SkeletonTable = memo(({ rows = 5, columns = 5, className = '', ...props }) => {
  return (
    <div 
      className={`border border-table-border bg-table-bg overflow-hidden ${className}`.trim()}
      {...props}
    >
      {/* Table Header */}
      <div className="bg-table-head-bg border-b border-table-head-border px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <div 
            key={cIdx} 
            className="h-4 skeleton-shimmer flex-grow" 
            style={{ maxWidth: cIdx === 0 ? '25%' : '15%' }} 
          />
        ))}
      </div>

      {/* Table Body Rows */}
      <div className="divide-y divide-table-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div 
            key={rIdx} 
            className="px-6 py-5 flex items-center gap-4 hover:bg-table-row-hover-bg transition-colors duration-300"
          >
            {Array.from({ length: columns }).map((_, cIdx) => {
              if (cIdx === 0) {
                return (
                  <div key={cIdx} className="flex items-center gap-3 flex-grow" style={{ maxWidth: '25%' }}>
                    {/* Tiny Square Thumbnail (e.g. product/category image) */}
                    <div className="w-10 h-10 skeleton-shimmer shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 skeleton-shimmer w-36" />
                      <div className="h-2 skeleton-shimmer w-20 opacity-60" />
                    </div>
                  </div>
                );
              }
              return (
                <div 
                  key={cIdx} 
                  className="h-3 skeleton-shimmer flex-grow" 
                  style={{ maxWidth: '15%' }} 
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
SkeletonTable.displayName = 'Skeleton.Table';

/**
 * Skeleton Form inputs representation
 */
export const SkeletonForm = memo(({ rows = 4, className = '', ...props }) => {
  return (
    <div 
      className={`space-y-sp-6 border border-card-border-editorial bg-card-bg-primary p-card-lg ${className}`.trim()}
      {...props}
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="space-y-sp-2">
          {/* Label */}
          <div className="w-28 h-3 skeleton-shimmer opacity-85" />
          {/* Field Input Box */}
          <div className="w-full h-11 skeleton-shimmer" />
        </div>
      ))}
      {/* Actions */}
      <div className="flex justify-end gap-sp-4 pt-sp-4">
        <div className="w-24 h-10 skeleton-shimmer" />
        <div className="w-36 h-10 skeleton-shimmer" />
      </div>
    </div>
  );
});
SkeletonForm.displayName = 'Skeleton.Form';

/**
 * Skeleton Product Detail page details representation
 */
export const SkeletonProductDetail = memo(({ className = '', ...props }) => {
  return (
    <div 
      className={`grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen ${className}`.trim()}
      {...props}
    >
      {/* Left Column: Media Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 flex-shrink-0 overflow-x-auto md:overflow-x-visible">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="w-16 h-20 skeleton-shimmer border border-luxury-charcoal/10 flex-shrink-0" />
          ))}
        </div>
        {/* Main Display image */}
        <div className="flex-grow aspect-[3/4] skeleton-shimmer border border-luxury-charcoal/5" />
      </div>

      {/* Right Column: Information Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6 text-left">
        <div className="space-y-3">
          {/* Breadcrumb line */}
          <div className="w-48 h-3 skeleton-shimmer opacity-60" />
          {/* Title */}
          <div className="w-5/6 h-8 skeleton-shimmer" />
        </div>

        {/* Price & Rating */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-6 skeleton-shimmer" />
          <div className="w-20 h-5 skeleton-shimmer opacity-60" />
        </div>

        {/* Editorial description */}
        <div className="border-t border-b border-luxury-charcoal/10 py-6 space-y-4">
          <div className="h-4 skeleton-shimmer w-full" />
          <div className="h-4 skeleton-shimmer w-11/12" />
          <div className="h-4 skeleton-shimmer w-4/5" />
        </div>

        {/* Shopping attributes */}
        <div className="space-y-4 pt-2">
          <div className="flex gap-4">
            {/* Quantity */}
            <div className="w-24 h-12 skeleton-shimmer" />
            {/* Add to cart */}
            <div className="flex-grow h-12 skeleton-shimmer" />
          </div>
          {/* Out of stock/Wishlist or alternative action */}
          <div className="w-full h-12 skeleton-shimmer opacity-85" />
        </div>
      </div>
    </div>
  );
});
SkeletonProductDetail.displayName = 'Skeleton.ProductDetail';

/**
 * Skeleton Dashboard widgets outline
 */
export const SkeletonDashboard = memo(({ className = '', ...props }) => {
  return (
    <div className={`space-y-8 ${className}`.trim()} {...props}>
      {/* Title block */}
      <div className="flex justify-between items-center gap-4">
        <div className="space-y-2">
          <div className="w-56 h-8 skeleton-shimmer" />
          <div className="w-96 h-3.5 skeleton-shimmer opacity-65" />
        </div>
        <div className="w-48 h-10 skeleton-shimmer hidden md:block" />
      </div>

      {/* Grid of Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div 
            key={idx} 
            className="border border-card-border-admin bg-card-bg-admin p-6 rounded-card-admin flex justify-between items-center"
          >
            <div className="space-y-3">
              <div className="w-24 h-3 skeleton-shimmer opacity-65" />
              <div className="w-32 h-7 skeleton-shimmer" />
            </div>
            <div className="w-12 h-12 skeleton-shimmer rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      {/* Graphs and side listing block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large SVG Curve Chart Placeholder */}
        <div className="lg:col-span-2 border border-card-border-admin bg-card-bg-admin p-6 rounded-card-admin space-y-4">
          <div className="w-44 h-4 skeleton-shimmer" />
          <div className="w-full h-[240px] skeleton-shimmer" />
        </div>

        {/* List of items sidebar skeleton */}
        <div className="border border-card-border-admin bg-card-bg-admin p-6 rounded-card-admin space-y-4">
          <div className="w-44 h-4 skeleton-shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3">
                <div className="w-10 h-10 skeleton-shimmer rounded shrink-0" />
                <div className="flex-grow space-y-1">
                  <div className="w-28 h-3.5 skeleton-shimmer" />
                  <div className="w-16 h-2 skeleton-shimmer opacity-60" />
                </div>
                <div className="w-12 h-4 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
SkeletonDashboard.displayName = 'Skeleton.Dashboard';

// Attach all skeletons to a namespace object
const SkeletonNamespace = Skeleton;
SkeletonNamespace.Card = SkeletonCard;
SkeletonNamespace.ProductGrid = SkeletonProductGrid;
SkeletonNamespace.Table = SkeletonTable;
SkeletonNamespace.Form = SkeletonForm;
SkeletonNamespace.ProductDetail = SkeletonProductDetail;
SkeletonNamespace.Dashboard = SkeletonDashboard;

export default SkeletonNamespace;
