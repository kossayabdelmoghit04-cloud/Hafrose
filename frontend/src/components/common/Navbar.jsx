import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiSearch,
  FiMenu,
  FiX,
  FiHeart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiTag,
  FiCheck,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import SearchOverlay from './SearchOverlay';
import MegaMenu from './MegaMenu';
import ScrollProgressBar from './ScrollProgressBar';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

// ─── Constante livraison gratuite ─────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 150;

// ─── Codes promo valides (simulation front — à valider côté backend en prod) ──
const PROMO_CODES = {
  HAFROSE10: { discount: 0.10, label: '−10%' },
  BIENVENUE: { discount: 0.15, label: '−15%' },
  MAISON20:  { discount: 0.20, label: '−20%' },
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { name: 'Accueil', path: '/', mega: false },
  { name: 'Boutique', path: '/shop', mega: true },
  { name: 'À Propos', path: '/about', mega: false },
  { name: 'Contact', path: '/contact', mega: false },
];

const SCROLL_THRESHOLD = 50;

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = memo(function Navbar({ announcementVisible = true }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // ── Promo code state ──────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount, label }
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Intelligent Header state
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Hover delay timers pour le MegaMenu
  const megaHoverTimerRef = useRef(null);

  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const location = useLocation();

  // ── Intelligent Header Scroll (Hide on scroll down / Show on scroll up) + Glassmorphism
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // Glassmorphism threshold
          setScrolled(currentY > SCROLL_THRESHOLD);

          // Scroll direction (Hide/Show)
          if (currentY < 80) {
            setHeaderVisible(true);
          } else if (currentY > lastScrollYRef.current + 8) {
            // Scroll descendant -> masquer header & fermer megamenu
            setHeaderVisible(false);
            setIsMegaOpen(false);
          } else if (currentY < lastScrollYRef.current - 8) {
            // Scroll montant -> faire apparaître header
            setHeaderVisible(true);
          }

          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fermeture menus sur changement de route
  useEffect(() => {
    setIsMobileOpen(false);
    setIsMegaOpen(false);
  }, [location.pathname]);

  // ── Écouteurs d'événements globaux (déclenchés depuis MobileBottomNav)
  useEffect(() => {
    const handleOpenSearch = () => {
      setIsMegaOpen(false);
      setIsSearchOpen(true);
    };
    const handleOpenCart = () => {
      setIsMegaOpen(false);
      setIsCartOpen(true);
    };

    window.addEventListener('hafrose:open-search', handleOpenSearch);
    window.addEventListener('hafrose:open-cart', handleOpenCart);

    return () => {
      window.removeEventListener('hafrose:open-search', handleOpenSearch);
      window.removeEventListener('hafrose:open-cart', handleOpenCart);
    };
  }, []);

  // ── Callbacks
  const openSearch = useCallback(() => {
    setIsMegaOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openCart = useCallback(() => {
    setIsMegaOpen(false);
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((v) => !v), []);

  // ── Gestion MegaMenu Hover delay
  const handleMegaEnter = useCallback(() => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    megaHoverTimerRef.current = setTimeout(() => {
      setIsMegaOpen(true);
    }, 150);
  }, []);

  const handleMegaLeave = useCallback(() => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    megaHoverTimerRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 200);
  }, []);

  return (
    <>
      {/* ── Navbar principale avec animation Hide/Show ────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: headerVisible ? 0 : '-100%',
          opacity: headerVisible ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="navbar__inner">

          {/* ── Bouton menu mobile ── */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={toggleMobile}
            aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-drawer"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiX size={20} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu size={20} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* ── Navigation desktop ── */}
          <nav
            className="navbar__desktop-nav"
            aria-label="Menu principal"
          >
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <div
                  key={link.name}
                  className="navbar__nav-item-wrap"
                  onMouseEnter={link.mega ? handleMegaEnter : undefined}
                  onMouseLeave={link.mega ? handleMegaLeave : undefined}
                >
                  <Link
                    to={link.path}
                    className={`navbar__nav-link${isActive ? ' navbar__nav-link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-expanded={link.mega ? isMegaOpen : undefined}
                    aria-haspopup={link.mega ? 'true' : undefined}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-bar"
                        className="navbar__nav-link-bar"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* ── Luxury Logo (Center) avec Hover Animation ── */}
          <div className="navbar__logo-wrap">
            <Link
              to="/"
              className="navbar__logo"
              aria-label="HAFROSE — Accueil"
            >
              <motion.span
                className="navbar__logo-name"
                whileHover={{
                  scale: 1.02,
                  rotate: 1.5,
                  letterSpacing: '0.3em',
                  textShadow: '0 0 12px rgba(181, 130, 140, 0.4)',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                HAFROSE
              </motion.span>
              <span className="navbar__logo-tagline" aria-hidden="true">
                Haute Maroquinerie
              </span>
            </Link>
          </div>

          {/* ── Actions droite ── */}
          <div className="navbar__actions" role="toolbar" aria-label="Actions">

            {/* Recherche */}
            <button
              type="button"
              onClick={openSearch}
              className="navbar__action-btn"
              aria-label="Ouvrir la recherche"
            >
              <FiSearch size={20} aria-hidden="true" />
            </button>

            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="navbar__action-btn"
              aria-label="Mes favoris"
              title="Favoris"
            >
              <FiHeart size={20} aria-hidden="true" />
            </Link>

            {/* Espace Client / Compte */}
            <Link
              to="/account/dashboard"
              className="navbar__action-btn"
              aria-label="Espace Client"
              title="Espace Client"
            >
              <FiUser size={20} aria-hidden="true" />
            </Link>

            {/* Panier avec Premium Cart Badge Animation */}
            <button
              type="button"
              onClick={openCart}
              className="navbar__action-btn navbar__cart-btn"
              aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
            >
              <FiShoppingBag size={20} aria-hidden="true" />
              <AnimatePresence mode="wait">
                {cartCount > 0 && (
                  <motion.span
                    key={`cart-count-${cartCount}`}
                    initial={{ scale: 0.4, opacity: 0, y: -4 }}
                    animate={{ scale: [1, 1.25, 1], opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.5, 1],
                    }}
                    className="navbar__cart-badge"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

          </div>
        </div>

        {/* ── Mega Menu Desktop ────────────────────────────────────────────── */}
        <MegaMenu
          isOpen={isMegaOpen}
          onClose={() => setIsMegaOpen(false)}
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
        />

        {/* ── Scroll Progress Indicator ───────────────────────────────────── */}
        <ScrollProgressBar />
      </motion.nav>

      {/* ── Search Overlay ──────────────────────────────────────────────────── */}
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        variant="drawer-left"
      >
        <Modal.Backdrop />
        <Modal.Container
          id="mobile-drawer"
          className="mobile-drawer"
        >
          <div className="mobile-drawer__header">
            <Link
              to="/"
              className="mobile-drawer__logo"
              onClick={() => setIsMobileOpen(false)}
              aria-label="HAFROSE — Accueil"
            >
              <span className="mobile-drawer__logo-name">HAFROSE</span>
              <span className="mobile-drawer__logo-tagline">Haute Maroquinerie</span>
            </Link>
            <Modal.CloseButton className="mobile-drawer__close" />
          </div>

          <nav className="mobile-drawer__nav" aria-label="Menu mobile">
            {NAV_LINKS.map((link, i) => {
              const isActive = location.pathname === link.path;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`mobile-drawer__nav-link${isActive ? ' mobile-drawer__nav-link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mobile-drawer__nav-link-text">{link.name}</span>
                    {isActive && (
                      <span className="mobile-drawer__nav-link-dot" aria-hidden="true" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="mobile-drawer__footer">
            <p className="mobile-drawer__footer-label">
              Maison de Luxe Parisienne
            </p>
            <Button
              to="/shop"
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setIsMobileOpen(false)}
            >
              Explorer la boutique
            </Button>
          </div>
        </Modal.Container>
      </Modal>

      {/* ── Cart Drawer ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCartOpen}
        onClose={closeCart}
        variant="drawer-right"
      >
        <Modal.Backdrop className="bg-anthracite/40 backdrop-blur-sm z-40" />
        <Modal.Container className="cart-drawer z-50">

          <div className="cart-drawer__header">
            <Modal.Title className="cart-drawer__title">
              Votre Panier
              <span className="cart-drawer__count" aria-live="polite" aria-atomic="true">
                ({cartCount})
              </span>
            </Modal.Title>
            <Modal.CloseButton className="cart-drawer__close" />
          </div>

          <div className="cart-drawer__divider" aria-hidden="true" />

          <div className="cart-drawer__items" role="list" aria-label="Articles dans votre panier">
            {cart.length === 0 ? (
              <div className="cart-drawer__empty">
                <FiShoppingBag className="cart-drawer__empty-icon" size={40} aria-hidden="true" />
                <p className="cart-drawer__empty-text">Votre panier est vide.</p>
                <Button variant="primary" size="sm" onClick={closeCart}>
                  Découvrir la boutique
                </Button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    role="listitem"
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="cart-item"
                  >
                    <div className="cart-item__image-wrap">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="cart-item__image"
                        loading="lazy"
                      />
                    </div>

                    <div className="cart-item__details">
                      <div className="cart-item__info">
                        <h4 className="cart-item__name">{item.product.name}</h4>
                        {item.product.material && (
                          <p className="cart-item__meta">{item.product.material}</p>
                        )}
                        <p className="cart-item__price">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      <div className="cart-item__controls">
                        <div className="cart-item__qty" role="group" aria-label={`Quantité de ${item.product.name}`}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="cart-item__qty-btn"
                            aria-label="Diminuer la quantité"
                          >
                            <FiMinus size={11} aria-hidden="true" />
                          </button>
                          <span className="cart-item__qty-value" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="cart-item__qty-btn"
                            aria-label="Augmenter la quantité"
                          >
                            <FiPlus size={11} aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="cart-item__remove"
                          aria-label={`Supprimer ${item.product.name} du panier`}
                        >
                          <FiTrash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {cart.length > 0 && (() => {
            // ── Calculs promotionnels ───────────────────────────────────────
            const discountAmount = appliedPromo ? cartTotal * appliedPromo.discount : 0;
            const finalTotal = cartTotal - discountAmount;
            const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
            const shippingPct = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
            const hasFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;

            const handleApplyPromo = () => {
              const code = promoInput.trim().toUpperCase();
              if (!code) { setPromoError('Entrez un code.'); return; }
              const promo = PROMO_CODES[code];
              if (promo) {
                setAppliedPromo({ code, ...promo });
                setPromoError('');
                setPromoSuccess(true);
                setTimeout(() => setPromoSuccess(false), 2500);
              } else {
                setAppliedPromo(null);
                setPromoError('Code invalide ou expiré.');
              }
            };

            const handleRemovePromo = () => {
              setAppliedPromo(null);
              setPromoInput('');
              setPromoError('');
            };

            return (
              <div className="cart-drawer__footer">

                {/* ── Barre livraison gratuite ─────────────────────────── */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FiTruck
                        size={13}
                        className={hasFreeShipping ? 'text-emerald-600' : 'text-warm-gray'}
                        aria-hidden="true"
                      />
                      <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray">
                        {hasFreeShipping
                          ? 'Livraison offerte !'
                          : `Encore ${formatPrice(remaining)} pour la livraison offerte`}
                      </span>
                    </div>
                    {hasFreeShipping && (
                      <FiCheck size={12} className="text-emerald-600" aria-hidden="true" />
                    )}
                  </div>
                  <div
                    className="w-full h-1 bg-beige rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(shippingPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${Math.round(shippingPct)}% vers la livraison gratuite`}
                  >
                    <motion.div
                      className={`h-full rounded-full ${
                        hasFreeShipping ? 'bg-success' : 'bg-rose-gold'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingPct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* ── Code Promo ──────────────────────────────────────── */}
                <div className="mb-5">
                  {appliedPromo ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-success-bg border border-success/20 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <FiTag size={12} className="text-success-text" />
                        <span className="font-sans text-xs text-success-text font-medium">
                          {appliedPromo.code}
                        </span>
                        <span className="font-sans text-[10px] text-success-text bg-success-bg px-1.5 py-0.5 rounded">
                          {appliedPromo.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="font-sans text-[10px] text-warm-gray hover:text-red-500 uppercase tracking-wider transition-colors"
                        aria-label="Retirer le code promo"
                      >
                        Retirer
                      </button>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          placeholder="Code promo"
                          aria-label="Code promotionnel"
                          className="flex-1 border border-beige bg-off-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:border-rose-gold transition-colors uppercase tracking-wider"
                          maxLength={20}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-wider hover:bg-rose-gold transition-colors"
                          aria-label="Appliquer le code promo"
                        >
                          <FiTag size={11} />
                          Appliquer
                        </button>
                      </div>
                      <AnimatePresence>
                        {promoError && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="font-sans text-[10px] text-red-500 mt-1.5 overflow-hidden"
                          >
                            {promoError}
                          </motion.p>
                        )}
                        {promoSuccess && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="font-sans text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1 overflow-hidden"
                          >
                            <FiCheck size={10} /> Code appliqué avec succès !
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* ── Totaux ─────────────────────────────────────────── */}
                <div className="space-y-2 mb-5">
                  <div className="cart-drawer__subtotal">
                    <span className="cart-drawer__subtotal-label">Sous-total</span>
                    <span className="cart-drawer__subtotal-value">{formatPrice(cartTotal)}</span>
                  </div>
                  {appliedPromo && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between"
                    >
                      <span className="font-sans text-xs text-emerald-700">
                        Remise ({appliedPromo.label})
                      </span>
                      <span className="font-sans text-xs font-semibold text-emerald-700">
                        −{formatPrice(discountAmount)}
                      </span>
                    </motion.div>
                  )}
                  {hasFreeShipping && (
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-emerald-600 uppercase tracking-wider">
                        Livraison
                      </span>
                      <span className="font-sans text-[10px] font-semibold text-emerald-600">
                        Offerte
                      </span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex items-center justify-between border-t border-beige pt-2">
                      <span className="font-sans text-xs uppercase tracking-widest text-luxury-charcoal font-medium">
                        Total
                      </span>
                      <span className="font-sans text-sm font-semibold text-rose-gold">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="cart-drawer__shipping-note">
                  Taxes incluses.{hasFreeShipping ? ' Livraison offerte.' : ' Livraison calculée à la commande.'}
                </p>

                <Button
                  to="/checkout"
                  variant="primary"
                  fullWidth
                  onClick={closeCart}
                >
                  Commander — {formatPrice(finalTotal)}
                </Button>

                <button
                  type="button"
                  onClick={closeCart}
                  className="cart-drawer__continue"
                >
                  Continuer mes achats
                </button>
              </div>
            );
          })()}

        </Modal.Container>
      </Modal>
    </>
  );
});

export default Navbar;
