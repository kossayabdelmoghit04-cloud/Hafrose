import {  forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { CheckboxProps } from './Checkbox.types';
import { cn } from '../../../utils/cn';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      disabled,
      checked,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = customId || generatedId;

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-center gap-3 cursor-pointer select-none text-body-sm text-neutral-800',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-xs border border-neutral-400 bg-white transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy-500 peer-focus-visible:ring-offset-1 peer-checked:bg-burgundy-500 peer-checked:border-burgundy-500 pointer-events-none',
                error && 'border-error-500',
                className
              )}
            />
            <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none stroke-[2.5]" />
          </div>
          {label && <span>{label}</span>}
        </label>
        {error && <p className="text-caption text-error-600 font-medium pl-8">{error}</p>}
        {!error && helperText && <p className="text-caption text-neutral-500 pl-8">{helperText}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
