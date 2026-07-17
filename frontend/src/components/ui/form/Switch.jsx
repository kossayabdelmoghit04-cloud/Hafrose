import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Luxury Switch Component — Phase 2.0.3
 *
 * Toggle boolean switch. Uses role="switch" + aria-checked.
 * Track: bg-form-switch-track → bg-form-switch-track-active
 * Thumb: white circle that translates left→right
 *
 * Fixed dimensions: track 44×24px, thumb 18×18px
 * Compose with <Form.Label> for the accessible label.
 */
const Switch = memo(function Switch({
  checked = false,
  onChange,
  disabled = false,
  id,
  label,
  className,
  ...props
}) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && onChange) onChange(!checked);
    }
  };

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        id={id}
        onClick={() => !disabled && onChange?.(!checked)}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative inline-flex items-center shrink-0 cursor-pointer',
          'w-[44px] h-[24px] rounded-none form-switch-track',
          'focus:outline-none focus-visible:outline-1 focus-visible:outline-rose-gold focus-visible:outline-offset-2',
          'transition-colors duration-400',
          checked ? 'bg-rose-gold' : 'bg-beige',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
        {...props}
      >
        {/* Thumb */}
        <span
          aria-hidden="true"
          className={clsx(
            'inline-block w-[18px] h-[18px] bg-off-white rounded-none',
            'shadow-[0_1px_3px_rgba(17,17,17,0.15)]',
            'transition-transform duration-400 ease-luxury',
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          )}
        />
      </button>

      {label && (
        <span className="text-[13px] font-sans font-light text-anthracite/80 select-none">
          {label}
        </span>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;
