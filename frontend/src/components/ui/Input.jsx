import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';
import { useFormField } from './form/FormFieldContext';

/**
 * Luxury Input Component — Phase 2.0.3 (Refactored)
 *
 * - forwardRef: fully compatible with react-hook-form (register / Controller)
 * - React.memo: prevents re-renders when parent state changes don't touch this field
 * - useFormField: auto-consumes id, aria-invalid, aria-describedby from <Form.Field>
 * - variant: 'default' | 'admin' | 'client' | 'filled' | 'ghost' | 'readonly'
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *
 * NOTE: Label, error messages and helper text are now handled externally by
 * <Form.Label>, <Form.Error>, and <Form.Helper> — keeping this component lean.
 */

/* ── Size map ── */
const SIZE_CLASSES = {
  xs: 'h-8  px-2 py-1   text-[11px]',
  sm: 'h-10 px-3 py-2   text-[12px]',
  md: 'h-12 px-4 py-3   text-[13px]',
  lg: 'h-14 px-5 py-4   text-[14px]',
  xl: 'h-16 px-6 py-5   text-[16px]',
};

/* ── Variant map ── */
function getVariantClasses(variant, hasError, hasSuccess) {
  const base = 'w-full font-sans font-light text-anthracite rounded-none outline-none form-field-transition form-focus-ring placeholder:text-warm-gray/50 placeholder:transition-opacity placeholder:duration-400 focus:placeholder:opacity-30 disabled:opacity-40 disabled:cursor-not-allowed';

  if (hasError) {
    return clsx(base, 'border border-error focus:border-error bg-form-bg');
  }
  if (hasSuccess) {
    return clsx(base, 'border border-success focus:border-success bg-form-bg');
  }

  switch (variant) {
    case 'admin':
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg-admin');

    case 'client':
      return clsx(base, 'border-0 border-b border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-transparent');

    case 'filled':
      return clsx(base, 'border-0 bg-form-bg-filled hover:bg-form-bg focus:bg-form-bg focus:border focus:border-form-border-focus');

    case 'ghost':
      return clsx(base, 'border-0 bg-transparent focus:border-b focus:border-form-border');

    case 'readonly':
      return clsx(base, 'border border-form-border bg-off-white/80 cursor-default pointer-events-none');

    default: // 'default'
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg');
  }
}

const Input = memo(
  forwardRef(function Input(
    {
      variant = 'default',
      size = 'md',
      error,
      success,
      type = 'text',
      id,
      className,
      ...props
    },
    ref
  ) {
    const ctx = useFormField();

    // IDs: prefer explicit prop → context → nothing (graceful degradation)
    const inputId        = id || ctx?.id;
    const ariaDescBy     = [
      ctx?.hasError   && ctx?.errorId,
      ctx?.helperId,
    ].filter(Boolean).join(' ') || undefined;
    const hasError   = error   !== undefined ? Boolean(error)   : ctx?.hasError   ?? false;
    const hasSuccess = success !== undefined ? Boolean(success) : ctx?.hasSuccess  ?? false;

    return (
      <input
        ref={ref}
        type={type}
        id={inputId}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={ariaDescBy || undefined}
        className={clsx(
          getVariantClasses(variant, hasError, hasSuccess),
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          className
        )}
        {...props}
      />
    );
  })
);

Input.displayName = 'Input';

export default Input;
