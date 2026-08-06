import React from 'react';
import { DividerProps } from './Divider.types';
import { cn } from '../../../utils/cn';

const spacingMap = {
  none: '', sm: 'my-4', md: 'my-6', lg: 'my-8',
};
const variantMap = {
  solid: 'border-solid', dashed: 'border-dashed', dotted: 'border-dotted',
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  spacing = 'md',
  className,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch bg-neutral-200', className)}
      />
    );
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-4', spacingMap[spacing], className)}>
        <hr className={cn('flex-1 border-t border-neutral-200', variantMap[variant])} />
        <span className="text-caption font-medium tracking-luxury uppercase text-neutral-400 flex-shrink-0">
          {label}
        </span>
        <hr className={cn('flex-1 border-t border-neutral-200', variantMap[variant])} />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={cn('border-0 border-t border-neutral-200', variantMap[variant], spacingMap[spacing], className)}
      {...props}
    />
  );
};
