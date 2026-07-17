import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';
import { useFormField } from './FormFieldContext';

/**
 * Luxury Select Component — Phase 2.0.3
 *
 * Styled native <select> with a custom SVG chevron.
 * Native select is used intentionally for maximum keyboard/screen reader
 * compatibility. Custom dropdown (Phase 2.0.4) will be opt-in via a prop.
 *
 * @param {Array<{value, label, disabled?}>} options
 * @param {string} placeholder - First disabled option shown as hint
 * @param {string} variant - 'default' | 'admin' | 'client' | 'filled'
 * @param {string} size    - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */

const SIZE_CLASSES = {
  xs: 'h-8  pl-2 pr-8  text-[11px]',
  sm: 'h-10 pl-3 pr-9  text-[12px]',
  md: 'h-12 pl-4 pr-10 text-[13px]',
  lg: 'h-14 pl-5 pr-11 text-[14px]',
  xl: 'h-16 pl-6 pr-12 text-[16px]',
};

// Chevron sizes per size variant
const CHEVRON_SIZE = {
  xs: 'w-3 h-3 right-2',
  sm: 'w-3.5 h-3.5 right-2.5',
  md: 'w-4 h-4 right-3',
  lg: 'w-4.5 h-4.5 right-3.5',
  xl: 'w-5 h-5 right-4',
};

function getVariantClasses(variant, hasError, hasSuccess) {
  const base = 'w-full appearance-none font-sans font-light text-anthracite rounded-none outline-none form-field-transition form-focus-ring cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  if (hasError)   return clsx(base, 'border border-error   focus:border-error   bg-form-bg');
  if (hasSuccess) return clsx(base, 'border border-success focus:border-success bg-form-bg');

  switch (variant) {
    case 'admin':
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg-admin');
    case 'client':
      return clsx(base, 'border-0 border-b border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-transparent');
    case 'filled':
      return clsx(base, 'border-0 bg-form-bg-filled focus:bg-form-bg focus:border focus:border-form-border-focus');
    default:
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg');
  }
}

const Select = memo(
  forwardRef(function Select(
    {
      variant = 'default',
      size = 'md',
      options = [],
      placeholder,
      error,
      success,
      id,
      className,
      ...props
    },
    ref
  ) {
    const ctx = useFormField();
    const selectId   = id || ctx?.id;
    const ariaDescBy = [ctx?.hasError && ctx?.errorId, ctx?.helperId]
      .filter(Boolean).join(' ') || undefined;
    const hasError   = error   !== undefined ? Boolean(error)   : ctx?.hasError   ?? false;
    const hasSuccess = success !== undefined ? Boolean(success) : ctx?.hasSuccess  ?? false;

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={ariaDescBy || undefined}
          className={clsx(
            getVariantClasses(variant, hasError, hasSuccess),
            SIZE_CLASSES[size] || SIZE_CLASSES.md,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron — pointer-events-none to let clicks pass through */}
        <span
          aria-hidden="true"
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none text-warm-gray/60',
            CHEVRON_SIZE[size] || CHEVRON_SIZE.md
          )}
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </span>
      </div>
    );
  })
);

Select.displayName = 'Select';

export default Select;
