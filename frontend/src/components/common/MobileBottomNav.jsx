import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSearch, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

/**
 * MobileBottomNav — HAFROSE Design System Phase 2
 * Navigation basse fixe sur mobile (< 768px).
 * Safe area iOS, Glassmorphism V2, badges dynamiques, masquage au scroll.
 */

const MobileBottomNav = memo(function MobileBottomNav({ onOpenSearch, onOpenCart }) {
  const location = useLocation();
  const { cartCount } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Masquage au scroll descendant, apparition au scroll montant
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Ne rien faire en haut de page (< 60px)
          if (currentY < 60) {
            setIsVisible(true);
          } else if (currentY > lastScrollY + 10) {
            // Scroll bas -> masquer
            setIsVisible(false);
          } else if (currentY < lastScrollY - 10) {
            // Scroll haut -> faire apparaître
            setIsVisible(true);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearchClick = useCallback(() => {
    if (onOpenSearch) onOpenSearch();
    else window.dispatchEvent(new CustomEvent('hafrose:open-search'));
  }, [onOpenSearch]);

  const handleCartClick = useCallback(() => {
    if (onOpenCart) onOpenCart();
    else window.dispatchEvent(new CustomEvent('hafrose:open-cart'));
  }, [onOpenCart]);

  const navItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: FiHome,
      path: '/',
      onClick: null,
    },
    {
      id: 'search',
      label: 'Recherche',
      icon: FiSearch,
      path: null,
      onClick: handleSearchClick,
    },
    {
      id: 'wishlist',
      label: 'Favoris',
      icon: FiHeart,
      path: '/shop?category=edition-limitee',
      onClick: null,
    },
    {
      id: 'cart',
      label: 'Panier',
      icon: FiShoppingBag,
      path: null,
      onClick: handleCartClick,
      badge: cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : null,
    },
    {
      id: 'account',
      label: 'Compte',
      icon: FiUser,
      path: '/admin/login',
      onClick: null,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mobile-bottom-nav"
          role="navigation"
          aria-label="Navigation basse mobile"
        >
          <div className="mobile-bottom-nav__inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path ? location.pathname === item.path : false;

              const content = (
                <>
                  <div className="mobile-bottom-nav__icon-wrap">
                    <Icon size={20} aria-hidden="true" />

                    {/* Badge Panier */}
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mobile-bottom-nav__badge"
                        aria-live="polite"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>

                  <span className="mobile-bottom-nav__label">
                    {item.label}
                  </span>

                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="mobileNavActiveDot"
                      className="mobile-bottom-nav__active-dot"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              );

              if (item.path) {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`mobile-bottom-nav__btn${isActive ? ' mobile-bottom-nav__btn--active' : ''}`}
                    aria-label={item.label}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="mobile-bottom-nav__btn"
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
});

export default MobileBottomNav;
