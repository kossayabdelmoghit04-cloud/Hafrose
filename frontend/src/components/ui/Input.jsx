import { forwardRef } from 'react';

/**
 * Premium Luxury Input Component
 * Uses forwardRef for integration with react-hook-form or focus management
 */
const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-luxury-charcoal/80"
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`w-full px-4 py-3 bg-white border border-luxury-charcoal/10 focus:border-luxury-gold outline-none text-xs font-sans font-light tracking-wide text-luxury-charcoal transition-all duration-300 placeholder:text-luxury-gray/50 rounded-none ${
          error ? 'border-rose-400 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      
      {error && (
        <span className="text-[10px] font-sans text-rose-500 font-light mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
