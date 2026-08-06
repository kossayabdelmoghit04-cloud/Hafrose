import {  forwardRef, useId } from 'react';
import { TextareaProps } from './Textarea.types';
import { cn } from '../../../utils/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess,
      className,
      disabled,
      required,
      id: customId,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body-sm font-medium text-neutral-800 tracking-wider"
          >
            {label}
            {required && <span className="ml-1 text-burgundy-500" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full bg-white border border-neutral-300 rounded-sm px-4 py-3 text-body-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed resize-y',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500 text-error-700',
            isSuccess && 'border-success-500 focus:border-success-500 focus:ring-success-500',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
