import {  forwardRef, useId } from 'react';
import { InputProps } from './Input.types';
import { cn } from '../../../utils/cn';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess,
      leftIcon,
      rightIcon,
      className,
      disabled,
      required,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-neutral-800 tracking-wider"
          >
            {label}
            {required && <span className="ml-1 text-burgundy-500" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-white border border-neutral-300 rounded-sm px-4 py-3 text-body-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500 text-error-700',
              isSuccess && 'border-success-500 focus:border-success-500 focus:ring-success-500',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-neutral-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-caption text-error-600 font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-caption text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
