import React from 'react';
import { BannerCardProps } from './BannerCard.types';
import { getImageUrl } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const BannerCard: React.FC<BannerCardProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  badgeText,
  cta,
  align = 'left',
  className,
}) => {
  const imageSrc = getImageUrl(imageUrl);

  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-md bg-cream-200 border border-cream-400',
        className
      )}
    >
      {/* Background Image (optional) */}
      {imageUrl && (
        <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream-200/95 to-cream-200/40" />
        </>
      )}

      {/* Content */}
      <div className={cn('relative z-10 flex flex-col gap-3 p-8 md:p-12', alignClasses[align])}>
        {badgeText && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-xs text-badge font-sans font-semibold tracking-luxury uppercase bg-gold-50 text-gold-800 border border-gold-200 w-fit">
            {badgeText}
          </span>
        )}
        {subtitle && (
          <span className="text-body-sm font-medium tracking-luxury uppercase text-burgundy-500">
            {subtitle}
          </span>
        )}
        <h2 className="font-serif text-h2 md:text-display-lg text-neutral-950 leading-tight max-w-lg">
          {title}
        </h2>
        {description && (
          <p className="text-body-base text-neutral-600 max-w-md leading-relaxed">{description}</p>
        )}
        {cta && <div className="pt-2">{cta}</div>}
      </div>
    </div>
  );
};
