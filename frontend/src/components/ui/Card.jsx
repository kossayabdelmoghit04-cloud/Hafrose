import React, { useMemo, useCallback, memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Safely wrap Link component with Framer Motion support
const MotionLink = motion.create ? motion.create(Link) : motion(Link);

// Design Token variant classes
const variantClasses = {
  default: 'bg-card-bg-primary border border-card-border-editorial rounded-card-editorial',
  outlined: 'bg-card-bg-primary border border-card-border-editorial rounded-card-editorial shadow-card-none',
  elevated: 'bg-card-bg-primary border border-card-border-editorial rounded-card-editorial shadow-card-soft hover:shadow-card-medium',
  flat: 'bg-transparent border-0 rounded-none shadow-card-none',
  luxury: 'bg-card-bg-primary border border-card-border-featured rounded-card-editorial shadow-card-soft hover:border-card-border-hover',
  featured: 'bg-card-bg-primary border border-card-border-featured rounded-card-editorial shadow-card-medium hover:shadow-card-luxury',
  admin: 'bg-card-bg-admin border border-card-border-admin rounded-card-admin shadow-card-sm hover:shadow-card-md',
  dashboard: 'bg-card-bg-admin border border-card-border-admin rounded-card-admin shadow-card-sm',
  statistic: 'bg-card-bg-admin border border-card-border-admin rounded-card-admin shadow-card-sm',
  product: 'bg-card-bg-primary border border-card-border-editorial rounded-none hover:border-card-border-hover transition-all duration-300',
  review: 'bg-card-bg-primary border border-card-border-editorial rounded-none shadow-card-none',
  media: 'bg-card-bg-admin border border-card-border-admin rounded-card-admin shadow-card-sm overflow-hidden group aspect-square',
  collection: 'bg-card-bg-editorial border border-card-border-editorial rounded-none relative overflow-hidden',
  category: 'relative overflow-hidden rounded-none bg-card-bg-secondary border-0 group',
  editorial: 'bg-card-bg-primary border border-card-border-editorial rounded-none shadow-card-none',
  service: 'bg-card-bg-primary border border-card-border-editorial rounded-none shadow-card-none',
  information: 'bg-card-bg-primary border border-card-border-editorial rounded-none shadow-card-none',
  alert: 'bg-card-bg-primary border-2 border-card-border-accent rounded-card-editorial',
  confirmation: 'bg-card-bg-primary border border-card-border-editorial rounded-none',
  empty: 'bg-card-bg-primary border-2 border-dashed border-card-border-dashed rounded-card-admin text-center'
};

// Design Token size classes matching index.css utilities
const sizeClasses = {
  xs: 'p-card-xs gap-card-xs text-xs',
  sm: 'p-card-sm gap-card-sm text-sm',
  md: 'p-card-md gap-card-md text-base',
  lg: 'p-card-lg gap-card-lg text-lg',
  xl: 'p-card-xl gap-card-xl text-xl'
};

/**
 * Polymorphic Luxury Card Component
 * Fully customizable, composable, responsive and keyboard navigable.
 */
const Card = memo(forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  hoverable = false,
  selected = false,
  disabled = false,
  loading = false,
  error = false,
  success = false,
  as,
  to,
  href,
  section = false,
  className = '',
  style = {},
  onClick,
  ...props
}, ref) => {
  // Resolve correct motion tag for polymorphism
  const Component = useMemo(() => {
    if (as) {
      if (as === Link) return MotionLink;
      return typeof as === 'string' ? (motion[as] || motion(as)) : motion(as);
    }
    if (to) return MotionLink;
    if (href) return motion.a;
    if (section) return motion.section;
    return motion.div;
  }, [as, to, href, section]);

  const activeVariant = useMemo(() => {
    const key = (variant || 'default').toLowerCase();
    return variantClasses[key] || variantClasses.default;
  }, [variant]);

  const activeSize = useMemo(() => {
    const key = (size || 'md').toLowerCase();
    return sizeClasses[key] || sizeClasses.md;
  }, [size]);

  // Combine sémantique visual states
  const stateClass = useMemo(() => {
    let classes = '';
    const hasHoverEffect = hoverable || variant === 'product' || variant === 'luxury' || variant === 'media' || variant === 'elevated';
    if (hasHoverEffect) {
      classes += ' cursor-pointer transition-all duration-300 hover:border-card-border-hover ';
    }
    if (selected) {
      classes += ' border-card-color-selected-border bg-card-bg-overlay-light ';
    }
    if (disabled) {
      classes += ' opacity-40 pointer-events-none cursor-not-allowed ';
    }
    if (error) {
      classes += ' border-card-border-accent ';
    }
    if (success) {
      classes += ' border-card-border-hover ';
    }
    return classes;
  }, [hoverable, variant, selected, disabled, error, success]);

  const handleClick = useCallback((e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  }, [disabled, loading, onClick]);

  const finalProps = useMemo(() => {
    const isTagLink = to || as === Link;
    const isTagAnchor = href || as === 'a';

    const baseProps = {
      ref,
      className: `flex flex-col relative overflow-hidden transition-all duration-300 ${activeVariant} ${activeSize} ${stateClass} ${className}`.trim(),
      style,
      onClick: handleClick,
      'aria-disabled': disabled || loading ? 'true' : undefined,
      'aria-busy': loading ? 'true' : undefined,
      ...props
    };

    if (isTagLink) {
      return {
        ...baseProps,
        to: disabled || loading ? '#' : to
      };
    }

    if (isTagAnchor) {
      return {
        ...baseProps,
        href: disabled || loading ? undefined : href
      };
    }

    return baseProps;
  }, [activeVariant, activeSize, stateClass, className, style, disabled, loading, handleClick, to, href, as, ref, props]);

  return (
    <Component {...finalProps}>
      {loading && (
        <div className="absolute inset-0 z-20 bg-card-bg-modal-backdrop flex items-center justify-center backdrop-blur-[2px]">
          <svg className="animate-spin h-6 w-6 text-card-color-accent" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      {children}
    </Component>
  );
}));

Card.displayName = 'Card';

// ── SUB-COMPONENTS ──

/** Header container */
const CardHeader = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between border-b border-card-border-editorial pb-3 mb-4 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardHeader.displayName = 'Card.Header';

/** Media wrapper handling ratios */
const CardMedia = memo(forwardRef(({ className = '', children, ratio = '3/4', ...props }, ref) => {
  const ratioClass = useMemo(() => {
    if (ratio === '3/4') return 'aspect-[3/4]';
    if (ratio === '1/1' || ratio === 'square') return 'aspect-square';
    if (ratio === '4/5') return 'aspect-[4/5]';
    if (ratio === '16/9' || ratio === 'landscape') return 'aspect-[16/9]';
    return '';
  }, [ratio]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden w-full bg-card-bg-secondary ${ratioClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}));
CardMedia.displayName = 'Card.Media';

/** Lazy image with zoom on hover */
const CardImage = memo(forwardRef(({
  className = '',
  src,
  alt = '',
  fallbackSrc = '',
  zoom = true,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}, ref) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}
      <motion.img
        ref={ref}
        src={imgSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-1800 ease-luxury will-change-transform ${
          zoom ? 'hover:scale-103' : ''
        } ${className}`.trim()}
        {...props}
      />
    </div>
  );
}));
CardImage.displayName = 'Card.Image';

/** Badge Overlay */
const CardBadge = memo(forwardRef(({
  className = '',
  variant = 'available',
  position = 'top-left',
  children,
  ...props
}, ref) => {
  const variantStyle = useMemo(() => {
    const styles = {
      available: { bg: 'var(--color-card-badge-available-bg)', text: 'var(--color-card-badge-available-text)' },
      unavailable: { bg: 'var(--color-card-badge-unavailable-bg)', text: 'var(--color-card-badge-unavailable-text)' },
      new: { bg: 'var(--color-card-badge-new-bg)', text: 'var(--color-card-badge-new-text)' },
      featured: { bg: 'var(--color-card-badge-featured-bg)', text: 'var(--color-card-badge-featured-text)' },
      pending: { bg: 'var(--color-card-badge-pending-bg)', text: 'var(--color-card-badge-pending-text)' }
    };
    return styles[variant] || styles.available;
  }, [variant]);

  const positionClass = useMemo(() => {
    const positions = {
      'top-left': 'absolute top-3 left-3 z-10',
      'top-right': 'absolute top-3 right-3 z-10',
      'bottom-left': 'absolute bottom-3 left-3 z-10',
      'bottom-right': 'absolute bottom-3 right-3 z-10',
      static: 'static inline-block'
    };
    return positions[position] || positions['top-left'];
  }, [position]);

  return (
    <span
      ref={ref}
      className={`font-sans text-[9px] font-medium tracking-[0.20em] uppercase py-1 px-2.5 leading-none transition-colors duration-300 ${positionClass} ${className}`.trim()}
      style={{
        backgroundColor: variantStyle.bg,
        color: variantStyle.text,
        borderRadius: 'var(--radius-card-badge, 0px)'
      }}
      {...props}
    >
      {children}
    </span>
  );
}));
CardBadge.displayName = 'Card.Badge';

/** Body content area */
const CardBody = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex-grow flex flex-col justify-between gap-3 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardBody.displayName = 'Card.Body';

/** Inner content stack */
const CardContent = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col gap-3 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardContent.displayName = 'Card.Content';

/** Font Display Title */
const CardTitle = memo(forwardRef(({ className = '', children, as = 'h3', ...props }, ref) => {
  const Component = as;
  return (
    <Component
      ref={ref}
      className={`font-display text-[15px] font-normal leading-tight tracking-[0.01em] text-card-color-title transition-colors duration-300 ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}));
CardTitle.displayName = 'Card.Title';

/** Font Sans Subtitle */
const CardSubtitle = memo(forwardRef(({ className = '', children, as = 'h4', ...props }, ref) => {
  const Component = as;
  return (
    <Component
      ref={ref}
      className={`font-sans text-[10px] font-medium tracking-[0.20em] uppercase text-card-color-subtitle ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}));
CardSubtitle.displayName = 'Card.Subtitle';

/** Font Sans light body text */
const CardDescription = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <p
    ref={ref}
    className={`font-sans text-[13px] font-light leading-relaxed text-card-color-body ${className}`.trim()}
    {...props}
  >
    {children}
  </p>
)));
CardDescription.displayName = 'Card.Description';

/** Metadata style */
const CardMeta = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`font-sans text-[9px] font-medium tracking-[0.20em] uppercase text-card-color-meta ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardMeta.displayName = 'Card.Meta';

/** Price indicator */
const CardPrice = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <p
    ref={ref}
    className={`font-sans text-[12px] font-medium tracking-[0.08em] text-card-color-price ${className}`.trim()}
    {...props}
  >
    {children}
  </p>
)));
CardPrice.displayName = 'Card.Price';

/** Divider */
const CardDivider = memo(forwardRef(({ className = '', ...props }, ref) => (
  <hr
    ref={ref}
    className={`border-t border-card-border-editorial my-3 ${className}`.trim()}
    {...props}
  />
)));
CardDivider.displayName = 'Card.Divider';

/** Footer container with actions line */
const CardFooter = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between border-t border-card-border-editorial pt-3 mt-auto ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardFooter.displayName = 'Card.Footer';

/** Actions flex row */
const CardActions = memo(forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex gap-2 items-center justify-end ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardActions.displayName = 'Card.Actions';

/** Hover overlay animation */
const CardOverlay = memo(forwardRef(({ className = '', children, active = false, ...props }, ref) => (
  <div
    ref={ref}
    className={`absolute inset-0 bg-card-bg-overlay-dark flex flex-col items-center justify-center gap-2 pointer-events-none transition-all duration-450 ease-luxury ${
      active ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-[8px]'
    } ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)));
CardOverlay.displayName = 'Card.Overlay';

// Attach all sub-components to parent Card namespace
Card.Header = CardHeader;
Card.Media = CardMedia;
Card.Image = CardImage;
Card.Badge = CardBadge;
Card.Body = CardBody;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Description = CardDescription;
Card.Meta = CardMeta;
Card.Price = CardPrice;
Card.Footer = CardFooter;
Card.Actions = CardActions;
Card.Divider = CardDivider;
Card.Overlay = CardOverlay;
Card.Content = CardContent;

export default Card;
