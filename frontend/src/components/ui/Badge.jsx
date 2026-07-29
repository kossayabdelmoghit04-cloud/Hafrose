/**
 * Refined Luxury Badge component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.variant - 'primary' | 'secondary' | 'gold' | 'outline' | 'success' | 'danger'
 * @param {string} props.className - Extra CSS classes
 */
export default function Badge({ children, variant = 'outline', className = '' }) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 text-[9px] tracking-widest font-sans font-medium uppercase transition-all duration-300';
  
  const variants = {
    primary: 'bg-luxury-charcoal text-luxury-cream border border-luxury-charcoal',
    secondary: 'bg-luxury-cream text-luxury-charcoal border border-luxury-cream shadow-sm',
    gold: 'bg-luxury-gold text-luxury-cream border border-luxury-gold',
    outline: 'border border-luxury-charcoal/20 text-luxury-charcoal/70 bg-transparent',
    success: 'bg-success-bg text-success-text border border-success/20',
    danger: 'bg-error-bg text-error-text border border-error/20'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
