import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import SearchOverlay from './SearchOverlay';
import MegaMenu from './MegaMenu';
import ScrollProgressBar from './ScrollProgressBar';
import NavBrand from './navbar/NavBrand';
import NavLinks from './navbar/NavLinks';
import NavActions from './navbar/NavActions';
import NavMobileDrawer from './navbar/NavMobileDrawer';
import CartDrawer from './navbar/CartDrawer';
import { useCart } from '../../context/CartContext';

const SCROLL_THRESHOLD = 50;

/**
 * Navbar — HAFROSE Luxury Header (Phase L1.1 Architecture)
 * Composant principal modularisé avec détection intelligente du défilement,
 * effet glassmorphism, MegaMenu desktop, tiroir mobile et panier d'orfèvrerie.
 */
const Navbar = memo(function Navbar({ announcementVisible = true }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const lastScrollYRef = useRef(0);
  const megaHoverTimerRef = useRef(null);

  const { cartCount } = useCart();
  const location = useLocation();

  // ── Scroll intelligent (Hide on scroll down / Show on scroll up) + Glassmorphism
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          setScrolled(currentY > SCROLL_THRESHOLD);

          if (currentY < 80) {
            setHeaderVisible(true);
          } else if (currentY > lastScrollYRef.current + 8) {
            setHeaderVisible(false);
            setIsMegaOpen(false);
          } else if (currentY < lastScrollYRef.current - 8) {
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

  // ── Fermeture des menus sur changement de route
  useEffect(() => {
    setIsMobileOpen(false);
    setIsMegaOpen(false);
  }, [location.pathname]);

  // ── Écouteurs d'événements globaux (déclenchés depuis MobileBottomNav / CTA)
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

  // ── Handlers & Callbacks
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

  // ── MegaMenu Hover delay avec courbe d'inertie
  const handleMegaEnter = useCallback(() => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    megaHoverTimerRef.current = setTimeout(() => {
      setIsMegaOpen(true);
    }, 120);
  }, []);

  const handleMegaLeave = useCallback(() => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    megaHoverTimerRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 180);
  }, []);

  return (
    <>
      {/* ── Navbar principale avec animation de masquage au scroll ── */}
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
          {/* Bouton mobile hamburger */}
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

          {/* Navigation Desktop */}
          <NavLinks
            isMegaOpen={isMegaOpen}
            onMegaEnter={handleMegaEnter}
            onMegaLeave={handleMegaLeave}
          />

          {/* Brand Logo & Monogram (Center) */}
          <NavBrand />

          {/* Action Icons (Search, Wishlist, Account, Cart) */}
          <NavActions
            onOpenSearch={openSearch}
            onOpenCart={openCart}
            cartCount={cartCount}
          />
        </div>

        {/* MegaMenu Dropdown Desktop */}
        <MegaMenu
          isOpen={isMegaOpen}
          onClose={() => setIsMegaOpen(false)}
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
        />

        {/* Scroll Progress Bar */}
        <ScrollProgressBar />
      </motion.nav>

      {/* Fullscreen Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />

      {/* Mobile Navigation Drawer */}
      <NavMobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Cart Drawer Modal */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
});

export default Navbar;
