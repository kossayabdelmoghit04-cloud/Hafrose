import React, { useId } from 'react';
import { SwitchProps } from './Switch.types';
import { cn } from '../../../utils/cn';

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id: customId,
  className,
}) => {
  const generatedId = useId();
  const switchId = customId || generatedId;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none text-body-sm text-neutral-800',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 focus-visible:ring-offset-2',
          checked ? 'bg-burgundy-500' : 'bg-neutral-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-hafrose-xs transition duration-250 ease-luxury',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
};
