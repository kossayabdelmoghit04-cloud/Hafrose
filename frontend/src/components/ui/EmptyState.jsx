import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

/**
 * Premium luxury EmptyState component matching Maison Hafrose aesthetics.
 * Uses a soft light backdrop, elegant Cormorant/Playfair typography, and thin metadata descriptions.
 */
export const EmptyState = memo(({
  icon,
  title,
  description,
  action,
  children,
  compact = false,
  centered = true,
  illustration,
  className = '',
  variant = 'empty', // 'empty' (dashed borders) | 'flat' (no borders, inline style)
  ...props
}) => {
  const Component = variant === 'flat' ? 'div' : Card;
  const cardProps = variant === 'flat' ? {} : { variant: 'empty', size: compact ? 'sm' : 'lg', animate: false };

  return (
    <Component
      className={`w-full text-center flex flex-col items-center justify-center ${
        variant === 'flat' ? '' : 'border-2 border-dashed border-card-border-dashed bg-card-bg-primary'
      } ${compact ? 'py-8 px-4 gap-2' : 'py-16 px-6 gap-4'} ${
        centered ? 'mx-auto' : ''
      } ${className}`.trim()}
      role="status"
      aria-live="polite"
      {...cardProps}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center justify-center"
      >
        {/* Render Illustration or Icon */}
        {illustration ? (
          <div className="mb-4 flex justify-center">{illustration}</div>
        ) : icon ? (
          <div className={`text-luxury-gold/50 flex justify-center items-center shrink-0 ${
            compact ? 'w-10 h-10 text-2xl mb-2' : 'w-16 h-16 text-4xl mb-3'
          }`}>
            {icon}
          </div>
        ) : null}

        {/* Title */}
        {title && (
          <h3 className={`font-serif text-luxury-charcoal font-light tracking-wide ${
            compact ? 'text-sm mb-1' : 'text-xl mb-2'
          }`}>
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p className={`text-luxury-gray font-sans font-light leading-relaxed max-w-md mx-auto ${
            compact ? 'text-[11px] mb-3' : 'text-xs mb-5'
          }`}>
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {action}
          </div>
        )}

        {children}
      </motion.div>
    </Component>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
