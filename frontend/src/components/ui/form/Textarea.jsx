import { forwardRef, memo } from 'react';
import { clsx } from 'clsx';
import { useFormField } from './FormFieldContext';

/**
 * Luxury Textarea Component — Phase 2.0.3
 *
 * Multi-line text input. Shares the same variant/size API as <Input>.
 * Use <Form.Counter current={value.length} max={5000} /> below for character count.
 */

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-[12px]',
  md: 'px-4 py-3 text-[13px]',
  lg: 'px-5 py-4 text-[14px]',
};

function getVariantClasses(variant, hasError, hasSuccess) {
  const base = 'w-full font-sans font-light text-anthracite rounded-none outline-none form-field-transition form-focus-ring placeholder:text-warm-gray/50 placeholder:transition-opacity focus:placeholder:opacity-30 disabled:opacity-40 disabled:cursor-not-allowed';

  if (hasError)   return clsx(base, 'border border-error   focus:border-error   bg-form-bg');
  if (hasSuccess) return clsx(base, 'border border-success focus:border-success bg-form-bg');

  switch (variant) {
    case 'admin':
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg-admin');
    case 'client':
      return clsx(base, 'border-0 border-b border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-transparent');
    case 'filled':
      return clsx(base, 'border-0 bg-form-bg-filled hover:bg-form-bg focus:bg-form-bg focus:border focus:border-form-border-focus');
    default:
      return clsx(base, 'border border-form-border hover:border-form-border-hover focus:border-form-border-focus bg-form-bg');
  }
}

const Textarea = memo(
  forwardRef(function Textarea(
    {
      variant = 'default',
      size = 'md',
      rows = 4,
      resize = 'none',
      error,
      success,
      id,
      className,
      ...props
    },
    ref
  ) {
    const ctx = useFormField();
    const textareaId = id || ctx?.id;
    const ariaDescBy = [ctx?.hasError && ctx?.errorId, ctx?.helperId]
      .filter(Boolean).join(' ') || undefined;
    const hasError   = error   !== undefined ? Boolean(error)   : ctx?.hasError   ?? false;
    const hasSuccess = success !== undefined ? Boolean(success) : ctx?.hasSuccess  ?? false;

    return (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-multiline="true"
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={ariaDescBy || undefined}
        className={clsx(
          getVariantClasses(variant, hasError, hasSuccess),
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          resize === 'y' ? 'resize-y' : 'resize-none',
          className
        )}
        {...props}
      />
    );
  })
);

Textarea.displayName = 'Textarea';

export default Textarea;
