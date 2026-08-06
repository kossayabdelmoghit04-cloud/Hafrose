import {  forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectProps } from './Select.types';
import { cn } from '../../../utils/cn';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helperText,
      error,
      placeholder,
      className,
      disabled,
      required,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-medium text-neutral-800 tracking-wider"
          >
            {label}
            {required && <span className="ml-1 text-burgundy-500" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full appearance-none bg-white border border-neutral-300 rounded-sm pl-4 pr-10 py-3 text-body-base text-neutral-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500 text-error-700',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 pointer-events-none" />
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

Select.displayName = 'Select';
