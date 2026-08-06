import {  forwardRef } from 'react';
import { ButtonProps } from './Button.types';
import { cn } from '../../../utils/cn';
import { Spinner } from '../Spinner';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-burgundy-500 text-white hover:bg-burgundy-600 active:bg-burgundy-800 shadow-hafrose-sm hover:shadow-hafrose-hover focus-visible:ring-burgundy-500',
      secondary: 'bg-rose-powder text-burgundy-800 hover:bg-rose-soft active:bg-rose-300 focus-visible:ring-burgundy-500',
      outline: 'bg-transparent border border-burgundy-500 text-burgundy-500 hover:bg-burgundy-500 hover:text-white focus-visible:ring-burgundy-500',
      ghost: 'bg-transparent text-neutral-800 hover:bg-rose-blush hover:text-burgundy-500 focus-visible:ring-burgundy-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-badge tracking-wider min-h-[36px]',
      md: 'px-6 py-3 text-body-sm tracking-luxury min-h-[44px]',
      lg: 'px-8 py-4 text-body-base tracking-luxury-wide min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium uppercase transition-all duration-250 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-xs select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2 text-current" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
