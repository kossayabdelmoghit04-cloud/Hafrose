import React from 'react';
import { FeatureCardProps } from './FeatureCard.types';
import { cn } from '../../../utils/cn';

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconVariant = 'burgundy',
  className,
}) => {
  const iconBg = {
    burgundy: 'bg-burgundy-50 text-burgundy-500',
    gold: 'bg-gold-50 text-gold-700',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center gap-4 p-6 bg-white rounded-md border border-neutral-200/60 shadow-hafrose-xs transition-all duration-350 ease-luxury hover:shadow-hafrose-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Icon Badge */}
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', iconBg[iconVariant])}>
        <span className="[&_svg]:w-6 [&_svg]:h-6 [&_svg]:stroke-[1.5]">{icon}</span>
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <h4 className="font-serif text-h5 text-neutral-900">{title}</h4>
        <p className="text-body-sm text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
