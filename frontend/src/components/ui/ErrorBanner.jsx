import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';

/**
 * Luxury ErrorBanner Component — HAFROSE Design System
 * 
 * Reusable inline error alert component replacing non-system alerts.
 * Integrated with Framer Motion, WCAG 2.2 AA (aria-live), and design tokens.
 */
export const ErrorBanner = memo(function ErrorBanner({
  title = 'Une erreur est survenue',
  message,
  onClose,
  className = '',
  role = 'alert',
}) {
  const content = message || title;
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        role={role}
        aria-live="assertive"
        className={`mb-6 p-4 bg-red-50/80 border-l-2 border-red-500 text-red-900 text-xs font-sans flex items-start justify-between gap-3 ${className}`.trim()}
      >
        <div className="flex items-start gap-2.5">
          <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={15} />
          <div>
            {message && title !== message && (
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-red-950 mb-0.5">
                {title}
              </h4>
            )}
            <p className="font-light leading-relaxed">{message || title}</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le message d'erreur"
            className="text-red-500 hover:text-red-800 transition-colors p-0.5 flex-shrink-0"
          >
            <FiX size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

ErrorBanner.displayName = 'ErrorBanner';

export default ErrorBanner;
