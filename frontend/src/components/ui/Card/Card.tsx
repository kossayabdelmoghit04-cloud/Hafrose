import {  forwardRef } from 'react';
import { CardProps } from './Card.types';
import { cn } from '../../../utils/cn';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverEffect = false,
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-white border border-neutral-200/60 shadow-hafrose-card',
      flat: 'bg-white border-none shadow-none',
      outline: 'bg-transparent border border-neutral-300 shadow-none',
      cream: 'bg-cream-200 border border-cream-400 shadow-hafrose-xs',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md overflow-hidden transition-all duration-350 ease-luxury',
          variantClasses[variant],
          hoverEffect && 'hover:shadow-hafrose-hover hover:border-rose-soft/80 hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
