import React from 'react';
import { SkeletonProps } from './Skeleton.types';
import { cn } from '../../../utils/cn';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-xs',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden bg-neutral-200/80 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-shimmer',
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
