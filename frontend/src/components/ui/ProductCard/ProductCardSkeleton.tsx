import React from 'react';
import { Skeleton } from '../Skeleton';

/**
 * ProductCardSkeleton
 * Used as loading placeholder for product grids while API data is fetching.
 */
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`} aria-hidden="true">
    <Skeleton variant="rectangular" className="aspect-[3/4] w-full rounded-md" />
    <div className="space-y-2 px-1">
      <Skeleton variant="text" width="60%" height={12} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
  </div>
);
