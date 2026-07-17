import { forwardRef, memo, useState, useCallback } from 'react';
import Input from '../Input';

/**
 * Luxury EmailField Component — Phase 2.0.3
 *
 * Wraps <Input type="email"> with optional onBlur format validation.
 * When validateOnBlur is true, an invalid email format sets an internal
 * error state that is surfaced via the error prop pattern (displayed by
 * <Form.Error> in the parent <Form.Field>).
 *
 * For use with react-hook-form: pass the {...register()} props directly.
 * RHF will handle validation natively; set validateOnBlur={false} in that case.
 */

// Simplified RFC-5322 regex (covers 99% of real-world cases)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EmailField = memo(
  forwardRef(function EmailField(
    {
      validateOnBlur = false,
      variant = 'default',
      size = 'md',
      onBlur,
      ...props
    },
    ref
  ) {
    const [internalError, setInternalError] = useState(null);

    const handleBlur = useCallback(
      (e) => {
        if (validateOnBlur) {
          const val = e.target.value.trim();
          if (val && !EMAIL_RE.test(val)) {
            setInternalError('Format d\'adresse e-mail invalide.');
          } else {
            setInternalError(null);
          }
        }
        onBlur?.(e);
      },
      [validateOnBlur, onBlur]
    );

    return (
      <Input
        ref={ref}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        variant={variant}
        size={size}
        error={props.error ?? internalError}
        onBlur={handleBlur}
        {...props}
      />
    );
  })
);

EmailField.displayName = 'EmailField';

export default EmailField;
