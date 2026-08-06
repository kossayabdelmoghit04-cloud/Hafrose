import {  forwardRef } from 'react';
import { IconButtonProps } from './IconButton.types';
import { cn } from '../../../utils/cn';
import { Spinner } from '../Spinner';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-white text-neutral-800 hover:text-burgundy-500 hover:bg-rose-blush border border-neutral-200/80 shadow-hafrose-xs',
      ghost: 'bg-transparent text-neutral-700 hover:text-burgundy-500 hover:bg-rose-blush',
      outline: 'bg-transparent text-burgundy-500 border border-burgundy-500 hover:bg-burgundy-500 hover:text-white',
      filled: 'bg-burgundy-500 text-white hover:bg-burgundy-600 active:bg-burgundy-800 shadow-hafrose-sm',
    };

    const sizeClasses = {
      sm: 'w-8 h-8 p-1.5 text-xs',
      md: 'w-10 h-10 p-2.5 text-sm',
      lg: 'w-12 h-12 p-3 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-200 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner size="sm" className="text-current" /> : icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
