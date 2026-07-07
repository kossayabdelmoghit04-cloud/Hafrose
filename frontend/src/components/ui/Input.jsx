import { forwardRef } from 'react';

/**
 * Premium Luxury Input Component
 * Uses forwardRef for integration with react-hook-form or focus management
 */
const Input = forwardRef(({
  label,
  error,
  success,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Determine border and outline styles based on status (error, success, or default)
  let borderClasses = 'border-beige hover:border-warm-gray focus:border-rose-gold focus-visible:outline-rose-gold';
  if (error) {
    borderClasses = 'border-error focus:border-error focus-visible:outline-error';
  } else if (success) {
    borderClasses = 'border-success focus:border-success focus-visible:outline-success';
  }

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-label text-anthracite/80 block select-none"
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`w-full px-4 py-3 bg-off-white text-xs font-sans font-light tracking-wide text-anthracite rounded-none outline-none border focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 transition-all duration-300 ease-luxury placeholder:text-warm-gray/60 placeholder:transition-colors placeholder:duration-300 focus:placeholder:text-warm-gray/30 disabled:opacity-40 disabled:cursor-not-allowed read-only:bg-off-white/80 read-only:cursor-default ${borderClasses} ${className}`}
        {...props}
      />
      
      {error && (
        <span className="text-[10px] font-sans text-error font-light mt-0.5 animate-fade-in">
          {error}
        </span>
      )}
      
      {success && !error && (
        <span className="text-[10px] font-sans text-success font-light mt-0.5 animate-fade-in">
          {typeof success === 'string' ? success : 'Option valide.'}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
