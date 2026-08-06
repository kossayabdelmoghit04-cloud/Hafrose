import {  forwardRef, useId } from 'react';
import { RadioProps } from './Radio.types';
import { cn } from '../../../utils/cn';

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      className,
      disabled,
      checked,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const radioId = customId || generatedId;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer select-none text-body-sm text-neutral-800',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-full border border-neutral-400 bg-white transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy-500 peer-focus-visible:ring-offset-1 peer-checked:border-burgundy-500',
              className
            )}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-burgundy-500 absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none" />
        </div>
        <div className="flex flex-col">
          {label && <span className="font-medium text-neutral-900">{label}</span>}
          {description && <span className="text-body-sm text-neutral-500">{description}</span>}
        </div>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
