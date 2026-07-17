import { forwardRef, memo, useCallback } from 'react';
import { clsx } from 'clsx';
import { useFormField } from './FormFieldContext';

/**
 * Luxury NumberField Component — Phase 2.0.3
 *
 * Numeric spinner with accessible +/- buttons.
 * role="spinbutton" with aria-valuenow/min/max for screen readers.
 *
 * Compatible with react-hook-form via forwardRef.
 */

const SIZE_CLASSES = {
  xs: 'h-8  text-[11px]',
  sm: 'h-10 text-[12px]',
  md: 'h-12 text-[13px]',
  lg: 'h-14 text-[14px]',
  xl: 'h-16 text-[16px]',
};

const BTN_CLASSES = {
  xs: 'w-7',
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-11',
  xl: 'w-12',
};

const NumberField = memo(
  forwardRef(function NumberField(
    {
      variant = 'admin',
      size = 'md',
      min,
      max,
      step = 1,
      value,
      onChange,
      id,
      className,
      error,
      ...props
    },
    ref
  ) {
    const ctx = useFormField();
    const fieldId   = id || ctx?.id;
    const ariaDescBy = [ctx?.hasError && ctx?.errorId, ctx?.helperId]
      .filter(Boolean).join(' ') || undefined;
    const hasError = error !== undefined ? Boolean(error) : ctx?.hasError ?? false;

    const numVal = value !== undefined ? Number(value) : undefined;

    const decrement = useCallback(() => {
      if (onChange) {
        const next = (numVal ?? 0) - step;
        if (min === undefined || next >= min) onChange({ target: { value: next } });
      }
    }, [numVal, step, min, onChange]);

    const increment = useCallback(() => {
      if (onChange) {
        const next = (numVal ?? 0) + step;
        if (max === undefined || next <= max) onChange({ target: { value: next } });
      }
    }, [numVal, step, max, onChange]);

    const btnBase = clsx(
      'flex items-center justify-center border-form-border text-warm-gray/70',
      'hover:text-rose-gold hover:bg-blush/30 focus-visible:text-rose-gold',
      'transition-colors duration-300 focus:outline-none focus-visible:outline-1 focus-visible:outline-rose-gold',
      'select-none shrink-0',
      SIZE_CLASSES[size],
      BTN_CLASSES[size]
    );

    const inputClasses = clsx(
      'flex-1 min-w-0 text-center font-sans font-light text-anthracite bg-transparent outline-none',
      'tabular-nums',
      SIZE_CLASSES[size]
    );

    const wrapperClasses = clsx(
      'flex w-full rounded-none overflow-hidden',
      'border border-form-border form-field-transition',
      hasError && 'border-error',
      !hasError && variant === 'admin' && 'border-form-border hover:border-form-border-hover focus-within:border-form-border-focus',
      className
    );

    return (
      <div className={wrapperClasses}>
        {/* Decrement */}
        <button
          type="button"
          tabIndex={0}
          aria-label={`Diminuer${min !== undefined ? ` (minimum ${min})` : ''}`}
          disabled={min !== undefined && numVal !== undefined && numVal <= min}
          onClick={decrement}
          className={clsx(btnBase, 'border-r border-form-border')}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
            <line x1="2" y1="6" x2="10" y2="6"/>
          </svg>
        </button>

        {/* Input */}
        <input
          ref={ref}
          id={fieldId}
          type="number"
          role="spinbutton"
          aria-valuenow={numVal}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={ariaDescBy}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={inputClasses}
          style={{ MozAppearance: 'textfield' }}
          {...props}
        />

        {/* Increment */}
        <button
          type="button"
          tabIndex={0}
          aria-label={`Augmenter${max !== undefined ? ` (maximum ${max})` : ''}`}
          disabled={max !== undefined && numVal !== undefined && numVal >= max}
          onClick={increment}
          className={clsx(btnBase, 'border-l border-form-border')}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
            <line x1="6" y1="2" x2="6" y2="10"/>
            <line x1="2" y1="6" x2="10" y2="6"/>
          </svg>
        </button>
      </div>
    );
  })
);

NumberField.displayName = 'NumberField';

export default NumberField;
