import React, { useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Safely wrap Link component with Framer Motion support across different versions
const MotionLink = motion.create ? motion.create(Link) : motion(Link);

const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  isLoading = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  as,
  href,
  to,
  appearance,
  tone,
  onClick,
  type = 'button',
  ...props
}) => {
  const activeLoading = loading || isLoading;

  // Polymorphic element resolution
  const MotionComponent = useMemo(() => {
    if (as) {
      if (as === Link) return MotionLink;
      return typeof as === 'string' ? (motion[as] || motion(as)) : motion(as);
    }
    if (to) return MotionLink;
    if (href) return motion.a;
    return motion.button;
  }, [as, to, href]);

  // Variant matching with backward compatibility redirects
  const variantClass = useMemo(() => {
    const key = (variant || 'primary').toLowerCase();
    
    const variants = {
      primary: 'bg-anthracite text-off-white border border-anthracite hover:bg-transparent hover:text-anthracite hover:shadow-luxury',
      secondary: 'bg-transparent text-anthracite border border-anthracite hover:bg-anthracite hover:text-off-white hover:shadow-luxury',
      outline: 'bg-transparent text-rose-gold border border-rose-gold hover:bg-rose-gold hover:text-off-white',
      ghost: 'bg-transparent text-warm-gray border border-transparent hover:text-anthracite',
      text: 'bg-transparent text-anthracite border border-transparent btn-text-underline px-0 py-1 hover:shadow-none',
      danger: 'bg-transparent text-error-text border border-error-text hover:bg-error-text hover:text-off-white',
      success: 'bg-transparent text-success-text border border-success-text hover:bg-success-text hover:text-off-white',
      luxury: 'bg-rose-gold text-off-white border border-rose-gold hover:bg-rose-gold-dark hover:border-rose-gold-dark'
    };

    // Redirects for deprecated/legacy variants
    if (key === 'gold' || key === 'rose') return variants.luxury;
    if (key === 'warm') return variants.outline;

    return variants[key] || variants.primary;
  }, [variant]);

  // Size mapping
  const sizeClass = useMemo(() => {
    const key = (size || 'md').toLowerCase();
    const sizes = {
      xs: 'px-3 py-1.5 text-[9px]',
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-8 py-3.5 text-[11px]',
      lg: 'px-12 py-4 text-[12px]',
      xl: 'px-16 py-5 text-[13px]'
    };
    return sizes[key] || sizes.md;
  }, [size]);

  // Semantic state classes (success/error override)
  const toneClass = useMemo(() => {
    const stateKey = (tone || appearance || '').toLowerCase();
    if (stateKey === 'error') {
      return 'btn-shake text-error-text border-error-text bg-error-bg/10';
    }
    if (stateKey === 'success') {
      return 'text-success-text border-success-text bg-success-bg/10';
    }
    return '';
  }, [tone, appearance]);

  // Base styling for luxury look-and-feel
  const baseStyle = useMemo(() => {
    return `inline-flex items-center justify-center uppercase tracking-[0.3em] font-medium font-sans btn-luxury-transition rounded-none select-none ${
      fullWidth ? 'w-full' : 'w-auto'
    }`;
  }, [fullWidth]);

  // Click handler to prevent navigation when disabled/loading
  const handleClick = useCallback((e) => {
    if (disabled || activeLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  }, [disabled, activeLoading, onClick]);

  // Determine spinner size based on button size
  const spinnerSizeClass = useMemo(() => {
    const sizesMap = {
      xs: 'h-3 w-3',
      sm: 'h-3 w-3',
      md: 'h-3.5 w-3.5',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4'
    };
    return sizesMap[size] || sizesMap.md;
  }, [size]);

  // Build element-specific properties
  const elementProps = useMemo(() => {
    const isTagLink = to || as === Link;
    const isTagAnchor = href || as === 'a';

    const baseProps = {
      className: `${baseStyle} ${variantClass} ${sizeClass} ${toneClass} ${className}`.trim(),
      onClick: handleClick,
      'aria-disabled': disabled || activeLoading ? 'true' : undefined,
      'aria-busy': activeLoading ? 'true' : undefined,
      whileTap: disabled || activeLoading ? undefined : { scale: 0.98 },
      ...props
    };

    if (isTagLink) {
      return {
        ...baseProps,
        to: disabled || activeLoading ? '#' : to
      };
    }

    if (isTagAnchor) {
      return {
        ...baseProps,
        href: disabled || activeLoading ? undefined : href
      };
    }

    return {
      ...baseProps,
      type,
      disabled: disabled || activeLoading
    };
  }, [baseStyle, variantClass, sizeClass, toneClass, className, disabled, activeLoading, handleClick, type, to, href, as, props]);

  return (
    <MotionComponent {...elementProps}>
      {activeLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className={`animate-spin text-current shrink-0 ${spinnerSizeClass}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && <span className="inline-flex items-center shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="inline-flex items-center shrink-0">{icon}</span>}
        </span>
      )}
    </MotionComponent>
  );
});

Button.displayName = 'Button';

export default Button;
