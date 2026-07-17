import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';

/**
 * Luxury Radio Component — Phase 2.0.3
 *
 * Visually replaces the native radio with a 16×16 concentric-circle design.
 * Native <input type="radio"> is sr-only for full a11y compatibility.
 *
 * States: unselected (empty circle), selected (Rose Gold inner dot), focus-visible ring
 */
const Radio = memo(
  forwardRef(function Radio(
    {
      checked,
      onChange,
      disabled = false,
      id,
      label,
      name,
      value,
      className,
      ...props
    },
    ref
  ) {
    return (
      <label
        className={clsx(
          'inline-flex items-start gap-2.5 cursor-pointer select-none',
          disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
      >
        {/* Hidden native radio */}
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        {/* Custom visual circle */}
        <span
          aria-hidden="true"
          className={clsx(
            'flex items-center justify-center shrink-0',
            'w-4 h-4 mt-0.5',
            'rounded-full border transition-colors duration-300',
            'peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-rose-gold peer-focus-visible:outline-offset-2',
            checked
              ? 'border-rose-gold'
              : 'border-form-check-border hover:border-form-border-hover',
          )}
        >
          {/* Inner dot — visible only when selected */}
          <span
            className={clsx(
              'w-2 h-2 rounded-full transition-all duration-300',
              checked ? 'bg-rose-gold scale-100' : 'bg-transparent scale-0'
            )}
          />
        </span>

        {/* Optional inline label */}
        {label && (
          <span className="text-[13px] font-sans font-light text-anthracite/80 leading-relaxed">
            {label}
          </span>
        )}
      </label>
    );
  })
);

Radio.displayName = 'Radio';

export default Radio;
