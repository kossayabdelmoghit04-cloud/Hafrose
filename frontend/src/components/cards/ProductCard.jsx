import { useState, memo, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi';
import { getProductImage, getProductGallery } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';
import Card from '../ui/Card';
import QuickViewModal from '../common/QuickViewModal';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

/**
 * ProductCard v2.1 — HAFROSE Design System Phase 7
 * Tilt 3D · Magnetic hover · Blur-up image · Animated badges
 */
function ProductCard({ product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef(null);
  const rafIdRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isAvailable = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const isFeatured = product.is_featured;
  const isWishlisted = isInWishlist(product.id);

  const gallery = useMemo(() => getProductGallery(product), [product]);
  const primaryImg = gallery[0] || getProductImage(product);
  const secondaryImg = gallery[1] || null;

  /* ── Event Handlers ── */
  const handleWishlistClick = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(product);
  }, [toggleWishlist, product]);

  const handleQuickViewClick = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsQuickViewOpen(true);
  }, []);

  const handleQuickAddClick = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (isAvailable) addToCart(product, 1);
  }, [isAvailable, addToCart, product]);

  /* ── 3D Tilt (rAF throttled & suppressed on touch/coarse devices) ── */
  const handleMouseMove = useCallback((e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    // Suppress tilt on touch / coarse pointer devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -6; // max 6deg
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 6;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      setTilt({ x: rx, y: ry });
    });
  }, [shouldReduceMotion]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const tiltStyle = shouldReduceMotion
    ? {}
    : { transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ ...tiltStyle, transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }}
      >
        <Card
          as={Link}
          to={`/product/${product.slug}`}
          variant="product"
          size="md"
          aria-label={`${product.name} — ${formatPrice(product.price)}`}
          className="group relative flex flex-col justify-between hover-elevate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sienne)] focus-visible:ring-offset-2 transition-all duration-300"
        >
          {/* ── Badges ── */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none" aria-live="polite">
            {isFeatured && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Card.Badge variant="featured" position="static" className="backdrop-blur-xs font-sans tracking-widest text-[9px] uppercase">
                  Exclusif
                </Card.Badge>
              </motion.div>
            )}
            {isLowStock && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Card.Badge variant="pending" position="static" className="backdrop-blur-xs font-sans tracking-widest text-[9px] uppercase">
                  Dernières Pièces
                </Card.Badge>
              </motion.div>
            )}
            {!isAvailable && (
              <Card.Badge variant="unavailable" position="static" className="backdrop-blur-xs font-sans tracking-widest text-[9px] uppercase">
                Rupture
              </Card.Badge>
            )}
          </div>

          {/* ── Wishlist Button ── */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 z-10 p-2.5 transition-all duration-300 ${
              isWishlisted
                ? 'bg-[var(--color-albatros)] text-[var(--color-sienne)] shadow-md scale-110'
                : 'bg-[var(--color-albatros)]/80 text-[var(--color-noyer)] hover:text-[var(--color-sienne)] hover:bg-[var(--color-albatros)] hover:scale-105'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sienne)]`}
            aria-label={isWishlisted ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
            aria-pressed={isWishlisted}
          >
            <motion.div
              whileTap={{ scale: 0.65 }}
              animate={isWishlisted ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <FiHeart size={15} className={isWishlisted ? 'fill-current' : ''} aria-hidden="true" />
            </motion.div>
          </button>

          {/* ── Image Container ── */}
          <Card.Media ratio="3/4" className="relative overflow-hidden bg-[var(--color-travertin)]">
            {/* Blur-up: placeholder skeleton in Travertin token */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-[var(--color-travertin)] animate-pulse" aria-hidden="true" />
            )}

            {/* Primary Image */}
            <img
              src={primaryImg}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              } ${
                secondaryImg
                  ? 'group-hover:opacity-0 group-hover:scale-[1.05]'
                  : 'group-hover:scale-[1.04]'
              }`}
            />

            {/* Secondary Image */}
            {secondaryImg && (
              <img
                src={secondaryImg}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                aria-hidden="true"
              />
            )}

            {/* ── Action Overlay ── */}
            <div
              className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--color-encre)]/75 via-[var(--color-encre)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center gap-2"
              aria-hidden={!isHovered}
            >
              <motion.button
                type="button"
                onClick={handleQuickViewClick}
                whileTap={{ scale: 0.93 }}
                className="bg-[var(--color-albatros)]/95 text-[var(--color-encre)] hover:text-[var(--color-sienne)] font-sans text-[9px] font-medium tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-sienne)]"
                aria-label={`Aperçu rapide de ${product.name}`}
              >
                <FiEye size={12} aria-hidden="true" />
                <span>Aperçu</span>
              </motion.button>

              {isAvailable && (
                <motion.button
                  type="button"
                  onClick={handleQuickAddClick}
                  whileTap={{ scale: 0.93 }}
                  className="bg-[var(--color-sienne)] text-[var(--color-albatros)] hover:bg-[var(--color-noyer)] font-sans text-[9px] font-medium tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-albatros)]"
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  <FiShoppingBag size={12} aria-hidden="true" />
                  <span>+ Panier</span>
                </motion.button>
              )}
            </div>
          </Card.Media>

          {/* ── Détails Produit ── */}
          <Card.Body className="p-card-md text-center">
            <Card.Content className="gap-1">
              {product.material && (
                <Card.Meta className="text-[11px] uppercase tracking-widest text-[var(--color-sienne)] font-light">
                  {product.material}
                </Card.Meta>
              )}
              <Card.Title className="font-serif text-base md:text-lg font-light tracking-wide text-[var(--color-encre)] group-hover:text-[var(--color-sienne)] transition-colors duration-400">
                {product.name}
              </Card.Title>
            </Card.Content>

            <Card.Footer className="justify-center gap-2 border-t border-[var(--color-travertin)]/60 pt-3 mt-2">
              <Card.Price className="font-serif text-sm md:text-base font-normal tracking-wider text-[var(--color-noyer)]">
                {formatPrice(product.price)}
              </Card.Price>
            </Card.Footer>
          </Card.Body>
        </Card>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default memo(ProductCard);
