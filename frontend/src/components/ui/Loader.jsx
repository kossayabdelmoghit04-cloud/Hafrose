import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * LuxurySpinner - Elegant rotating outer ring with a central gold dot
 */
export const LuxurySpinner = memo(({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-[1.5px]',
    md: 'w-12 h-12 border-2',
    lg: 'w-18 h-18 border-[3px]'
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`.trim()}>
      {/* Outer Elegant Slow Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size] || sizeClasses.md} border-luxury-charcoal/5 border-t-luxury-gold rounded-full`}
      />
      
      {/* Tiny Center Glow dot */}
      <div className={`absolute rounded-full bg-luxury-gold ${
        size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
      }`} />
    </div>
  );
});
LuxurySpinner.displayName = 'LuxurySpinner';

/**
 * PageLoader - Premium glassmorphic full screen blocking loader
 */
export const PageLoader = memo(({ text = 'Maison Hafrose', size = 'md' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-luxury-cream/60 backdrop-blur-md flex flex-col items-center justify-center">
      <LuxurySpinner size={size} />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 font-serif text-xs tracking-[0.3em] uppercase text-luxury-charcoal font-light"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
});
PageLoader.displayName = 'PageLoader';

/**
 * SectionLoader - Discrete inline loader for specific cards or blocks
 */
export const SectionLoader = memo(({ message, size = 'sm', className = '' }) => {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center gap-3 ${className}`.trim()}>
      <LuxurySpinner size={size} />
      {message && (
        <p className="text-[10px] tracking-widest uppercase text-luxury-gray font-light font-sans">
          {message}
        </p>
      )}
    </div>
  );
});
SectionLoader.displayName = 'SectionLoader';

/**
 * Core Loader Component (Defaults to PageLoader if fullPage is true, or SectionLoader otherwise)
 */
const Loader = memo(({ fullPage = false, size = 'md', message = '' }) => {
  if (fullPage) {
    return <PageLoader text="Maison Hafrose" size={size} />;
  }
  return <SectionLoader message={message} size={size === 'md' ? 'sm' : size} />;
});

Loader.displayName = 'Loader';

// Attach subcomponents for dot notation usage
Loader.Spinner = LuxurySpinner;
Loader.Page = PageLoader;
Loader.Section = SectionLoader;

export default Loader;


