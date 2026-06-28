import { motion } from 'framer-motion';

/**
 * Reusable Premium Button with Framer Motion hover & tap effects.
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'gold' | 'outline' | 'text'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.isLoading - Shows loading spinner
 * @param {React.ReactNode} props.children
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-sans font-medium uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-luxury-charcoal text-luxury-cream border border-luxury-charcoal hover:bg-transparent hover:text-luxury-charcoal',
    secondary: 'bg-transparent text-luxury-charcoal border border-luxury-charcoal hover:bg-luxury-charcoal hover:text-luxury-cream',
    gold: 'bg-luxury-gold text-luxury-cream border border-luxury-gold hover:bg-luxury-gold-hover hover:border-luxury-gold-hover',
    outline: 'bg-transparent text-luxury-gold border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-cream',
    text: 'bg-transparent text-luxury-charcoal border-b border-transparent hover:border-luxury-charcoal px-0 py-1'
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 text-[10px]',
    md: 'text-xs px-8 py-3.5 text-[11px]',
    lg: 'text-sm px-12 py-4 text-[12px]'
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Traitement...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
