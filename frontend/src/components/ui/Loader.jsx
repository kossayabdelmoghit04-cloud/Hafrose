import { motion } from 'framer-motion';

/**
 * Premium Luxury Loader with gold spinner and backdrop blur
 * @param {Object} props
 * @param {boolean} props.fullPage - If true, occupies full screen with glassmorphism backdrop
 * @param {string} props.size - 'sm', 'md', 'lg'
 */
export default function Loader({ fullPage = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-[1.5px]',
    md: 'w-12 h-12 border-2',
    lg: 'w-18 h-18 border-[3px]'
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 z-50 bg-luxury-cream/60 backdrop-blur-md flex flex-col items-center justify-center'
    : 'w-full py-16 flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer Elegant Slow Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} border-luxury-charcoal/5 border-t-luxury-gold rounded-full`}
        />
        
        {/* Tiny Center Glow dot */}
        <div className={`absolute rounded-full bg-luxury-gold ${
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
        }`} />
      </div>
      
      {fullPage && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 font-serif text-xs tracking-[0.3em] uppercase text-luxury-charcoal font-light"
        >
          Maison Hafrose
        </motion.p>
      )}
    </div>
  );
}
