import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiUser, FiShoppingBag } from 'react-icons/fi';

const NavActions = memo(function NavActions({ onOpenSearch, onOpenCart, cartCount }) {
  return (
    <div className="navbar__actions" role="toolbar" aria-label="Actions">
      {/* Recherche */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="navbar__action-btn"
        aria-label="Ouvrir la recherche"
      >
        <FiSearch size={20} aria-hidden="true" />
      </button>

      {/* Wishlist / Favoris */}
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

      {/* Panier avec animation de badge d'orfèvrerie */}
      <button
        type="button"
        onClick={onOpenCart}
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
  );
});

export default NavActions;
