import {  forwardRef, useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import { NumberInputProps } from './NumberInput.types';
import { IconButton } from '../IconButton';
import { cn } from '../../../utils/cn';

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 99,
      step = 1,
      label,
      decrementLabel = 'Diminuer la quantité',
      incrementLabel = 'Augmenter la quantité',
      disabled,
      className,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;

    const handleDecrement = () => {
      if (value > min) {
        onChange(value - step);
      }
    };

    const handleIncrement = () => {
      if (value < max) {
        onChange(value + step);
      }
    };

    return (
      <div className="space-y-1.5 inline-block">
        {label && (
          <label htmlFor={inputId} className="block text-body-sm font-medium text-neutral-800 tracking-wider">
            {label}
          </label>
        )}
        <div className={cn('inline-flex items-center border border-neutral-300 rounded-sm bg-white p-1', className)}>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={decrementLabel}
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            icon={<Minus className="w-3.5 h-3.5" />}
          />
          <input
            ref={ref}
            id={inputId}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                onChange(Math.min(max, Math.max(min, val)));
              }
            }}
            className="w-12 text-center text-body-base font-semibold text-neutral-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            {...props}
          />
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={incrementLabel}
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            icon={<Plus className="w-3.5 h-3.5" />}
          />
        </div>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
