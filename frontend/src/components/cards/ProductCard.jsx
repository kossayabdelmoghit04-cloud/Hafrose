import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

/* ─────────────────────────────────────────────────────────────────────────────
   ProductCard — Phase 1.8 · Luxury Blueprint
   Visual refonte uniquement. Aucune logique métier modifiée.
   Props: { product }  (inchangé)
   ───────────────────────────────────────────────────────────────────────────── */

/** Badges selon les tokens Design System */
function ProductBadge({ variant, children }) {
  const styles = {
    available: {
      bg: 'var(--color-success-bg)',
      color: 'var(--color-success-text)',
    },
    unavailable: {
      bg: 'var(--color-error-bg)',
      color: 'var(--color-error-text)',
    },
    new: {
      bg: 'var(--color-rose-poudre)',
      color: 'var(--color-rose-gold-dark)',
    },
    featured: {
      bg: 'var(--color-warm-gold)',
      color: 'var(--color-off-white)',
    },
  };

  const s = styles[variant] || styles.available;

  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: 'var(--font-body)',
        fontSize: '9px',
        fontWeight: 500,
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        lineHeight: 1.4,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Premium Product Card — Luxury Blueprint
 * Memoized to prevent redundant renders under parent filter/search triggers.
 */
function ProductCard({ product }) {
  const isAvailable = product.stock > 0;
  const isFeatured = product.is_featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-label={product.name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-off-white)',
        border: '1px solid var(--color-beige)',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        /* no permanent shadow per Blueprint */
        transition: 'border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-rose-gold)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-beige)';
      }}
    >
      {/* ── Badge Row ── */}
      {(isFeatured || !isAvailable) && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {isFeatured && <ProductBadge variant="featured">Exclusif</ProductBadge>}
          {!isAvailable && <ProductBadge variant="unavailable">Indisponible</ProductBadge>}
        </div>
      )}

      {/* ── Image Container ── */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={`Voir ${product.name}`}
        className="product-card__image-wrap"
        style={{
          display: 'block',
          position: 'relative',
          aspectRatio: '3 / 4',
          overflow: 'hidden',
          backgroundColor: 'var(--color-blush)',
        }}
      >
        <img
          src={getProductImage(product)}
          alt={product.name}
          loading="lazy"
          className="product-card__img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            /* GPU-accelerated zoom — transform only, no layout properties */
            transform: 'scale(1)',
            transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* ── Quick View Overlay — desktop hover only ── */}
        <div
          className="product-card__overlay"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '20px',
            /* fade + slide from bottom using transform + opacity only */
            opacity: 0,
            transform: 'translateY(8px)',
            transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'linear-gradient(to top, rgba(17,17,17,0.18) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              backgroundColor: 'var(--color-off-white)',
              color: 'var(--color-anthracite)',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.30em',
              textTransform: 'uppercase',
              padding: '10px 24px',
              display: 'inline-block',
            }}
          >
            Aperçu rapide
          </span>
        </div>
      </Link>

      {/* ── Product Info ── */}
      <div
        style={{
          padding: '20px 20px 24px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'var(--color-off-white)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Material label — caption style */}
          {product.material && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-warm-gray)',
                margin: 0,
              }}
            >
              {product.material}
            </p>
          )}

          {/* Product Name — H3 Blueprint · Playfair Display */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',   /* Playfair Display */
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '0.02em',
              color: 'var(--color-anthracite)',
              margin: 0,
              transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Link
              to={`/product/${product.slug}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-rose-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; }}
            >
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price + availability badge row */}
        <div
          style={{
            borderTop: '1px solid var(--color-beige)',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {/* Price — Plus Jakarta Sans, discreet, never dominates the name */}
          <p
            style={{
              fontFamily: 'var(--font-body)',      /* Plus Jakarta Sans */
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              /* Rose Gold Dark — WCAG AA contrast on Off White */
              color: 'var(--color-rose-gold-dark)',
              margin: 0,
            }}
          >
            {formatPrice(product.price)}
          </p>

          {/* Availability inline badge */}
          {isAvailable ? (
            <ProductBadge variant="available">Disponible</ProductBadge>
          ) : (
            <ProductBadge variant="unavailable">Indisponible</ProductBadge>
          )}
        </div>
      </div>

      {/* ── Focus ring (keyboard navigation) — global :focus-visible handles it ── */}
    </motion.article>
  );
}

export default memo(ProductCard);
