import { forwardRef, memo, useState } from 'react';
import { clsx } from 'clsx';
import Input from '../Input';

/**
 * Luxury PasswordField Component — Phase 2.0.3
 *
 * Wraps <Input> with a toggleable visibility button.
 * The eye icon is purely presentational (aria-hidden), with
 * an accessible label on the toggle button itself.
 */
const PasswordField = memo(
  forwardRef(function PasswordField(
    {
      showToggle = true,
      variant = 'admin',
      size = 'md',
      className,
      ...props
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);

    // Size → right padding to make room for the toggle button
    const paddingRight = { xs: 'pr-8', sm: 'pr-9', md: 'pr-10', lg: 'pr-11', xl: 'pr-12' };
    const iconSize = { xs: 'w-3.5 h-3.5', sm: 'w-4 h-4', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-5 h-5' };
    const iconRight = { xs: 'right-2', sm: 'right-2.5', md: 'right-3', lg: 'right-3.5', xl: 'right-4' };

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          variant={variant}
          size={size}
          autoComplete="current-password"
          className={clsx(showToggle && paddingRight[size], className)}
          {...props}
        />

        {showToggle && (
          <button
            type="button"
            tabIndex={0}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            className={clsx(
              'absolute top-1/2 -translate-y-1/2',
              iconRight[size] || iconRight.md,
              'text-warm-gray/60 hover:text-rose-gold focus-visible:text-rose-gold',
              'transition-colors duration-300 focus:outline-none focus-visible:outline-none',
              'p-0.5'
            )}
          >
            {visible ? (
              /* Eye-off icon */
              <svg className={iconSize[size] || iconSize.md} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* Eye icon */
              <svg className={iconSize[size] || iconSize.md} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    );
  })
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
