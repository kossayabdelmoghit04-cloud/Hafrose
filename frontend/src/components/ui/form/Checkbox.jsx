import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';

/**
 * Luxury Checkbox Component — Phase 2.0.3
 *
 * Visually replaces the native checkbox with a 16×16 square box
 * while keeping the native <input type="checkbox"> hidden (sr-only)
 * for full keyboard and screen-reader compatibility.
 *
 * States: unchecked, checked (Rose Gold fill + white checkmark), focus-visible ring
 * Animation: checkmark scales in via .animate-form-check
 */
const Checkbox = memo(
  forwardRef(function Checkbox(
    {
      checked,
      onChange,
      disabled = false,
      id,
      label,
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
        {/* Hidden native input — drives actual checked state */}
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        {/* Custom visual box */}
        <span
          aria-hidden="true"
          className={clsx(
            'flex items-center justify-center shrink-0',
            'w-4 h-4 mt-0.5 rounded-none border',
            'transition-colors duration-300',
            'peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-rose-gold peer-focus-visible:outline-offset-2',
            checked
              ? 'bg-rose-gold border-rose-gold'
              : 'bg-form-bg border-form-check-border hover:border-form-border-hover'
          )}
        >
          {checked && (
            <svg
              className="w-2.5 h-2.5 text-off-white animate-form-check"
              viewBox="0 0 10 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <polyline points="1 4 3.5 6.5 9 1" />
            </svg>
          )}
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
