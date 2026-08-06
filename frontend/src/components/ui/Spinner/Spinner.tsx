import React from 'react';
import { SpinnerProps } from './Spinner.types';
import { cn } from '../../../utils/cn';

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'burgundy',
  className,
  'aria-label': ariaLabel = 'Chargement en cours...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    burgundy: 'border-burgundy-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gold: 'border-gold-500 border-t-transparent',
    current: 'border-current border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};
