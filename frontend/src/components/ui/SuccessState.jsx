import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

/**
 * Luxury SuccessState Component — HAFROSE Design System
 * 
 * Reusable success state panel (icon + title + description + CTA).
 * Used across Auth forms, Newsletter, Contact, Orders, etc.
 */
export const SuccessState = memo(function SuccessState({
  title = 'Opération réussie',
  description,
  action,
  className = '',
  icon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
      className={`text-center py-8 px-4 space-y-4 ${className}`.trim()}
    >
      <div className="w-12 h-12 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold flex items-center justify-center mx-auto">
        {icon || <FiCheck size={22} />}
      </div>
      
      {title && (
        <h3 className="font-serif text-2xl text-luxury-charcoal font-light tracking-wide">
          {title}
        </h3>
      )}

      {description && (
        <p className="font-sans text-xs text-luxury-gray font-light leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      )}

      {action && (
        <div className="pt-2 flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  );
});

SuccessState.displayName = 'SuccessState';

export default SuccessState;
