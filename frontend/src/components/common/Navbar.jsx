import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiSearch, FiMenu, FiX, FiHeart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const location = useLocation();

  // Détecte le défilement pour adapter l'opacité de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ferme le menu mobile lors d'un changement de route
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Boutique', path: '/shop' },
    { name: 'À Propos', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-luxury-cream/90 backdrop-blur-md shadow-sm border-b border-luxury-charcoal/5 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Menu Mobile Button (Left) */}
          <button 
            type="button"
            className="md:hidden text-luxury-charcoal focus:outline-none cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Navigation Links (Left on desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative font-sans text-xs uppercase tracking-widest text-luxury-charcoal hover:text-luxury-gold transition-colors duration-300 font-medium py-1"
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBorder"
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Luxury Logo (Center) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="flex flex-col items-center">
              <span className="font-serif text-2xl md:text-3xl font-extralight tracking-[0.25em] text-luxury-charcoal select-none">
                HAFROSE
              </span>
              <span className="hidden md:block text-[7px] tracking-[0.6em] text-luxury-gold uppercase mt-0.5 ml-2 font-sans font-semibold">
                Haute Maroquinerie
              </span>
            </Link>
          </div>

          {/* Action Icons (Right) */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Search (Static placeholder for now) */}
            <button className="text-luxury-charcoal hover:text-luxury-gold transition-colors duration-300 cursor-pointer" aria-label="Recherche">
              <FiSearch size={18} />
            </button>

            {/* Wishlist */}
            <Link to="#" className="text-luxury-charcoal hover:text-luxury-gold transition-colors duration-300 cursor-pointer" aria-label="Favoris">
              <FiHeart size={18} />
            </Link>

            {/* Shopping Bag */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative text-luxury-charcoal hover:text-luxury-gold transition-colors duration-300 cursor-pointer focus:outline-none"
              aria-label="Panier"
            >
              <FiShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-luxury-gold text-luxury-cream text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-luxury-cream shadow-2xl z-50 md:hidden flex flex-col justify-between p-8"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-luxury-charcoal/5 pb-6">
                  <span className="font-serif text-xl tracking-[0.25em] text-luxury-charcoal">
                    HAFROSE
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    className="text-luxury-charcoal cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="flex flex-col space-y-6">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`font-sans text-xs uppercase tracking-widest font-medium transition-colors ${
                          isActive ? 'text-luxury-gold font-semibold' : 'text-luxury-charcoal hover:text-luxury-gold'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-luxury-charcoal/5 pt-6 space-y-4">
                <p className="text-[9px] tracking-widest uppercase text-luxury-gray text-center font-sans">
                  Maison de Luxe Parisienne
                </p>
                <Button variant="primary" size="sm" className="w-full text-center" onClick={() => window.location.href = '/shop'}>
                  Explorer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-luxury-cream shadow-2xl z-50 flex flex-col p-6 border-l border-luxury-charcoal/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-luxury-charcoal/5 pb-4 mb-6">
                <span className="font-serif text-lg tracking-wider text-luxury-charcoal">
                  Votre Panier ({cartCount})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                  aria-label="Fermer le panier"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <FiShoppingBag className="text-luxury-gray/30" size={48} />
                    <p className="text-sm font-sans text-luxury-gray font-light">
                      Votre panier est vide.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Continuer mes achats
                    </Button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex space-x-4 border-b border-luxury-charcoal/5 pb-4"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-luxury-light-gray flex-shrink-0 overflow-hidden border border-luxury-charcoal/5">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-xs font-light text-luxury-charcoal leading-tight">
                            {item.product.name}
                          </h4>
                          {item.product.material && (
                            <p className="text-[9px] tracking-wider uppercase text-luxury-gray font-sans font-light mt-1">
                              {item.product.material}
                            </p>
                          )}
                          <p className="text-xs font-sans text-luxury-gold mt-1 font-medium">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-luxury-charcoal/10">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                            >
                              <FiMinus size={10} />
                            </button>
                            <span className="px-2 text-xs font-sans font-light">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                              aria-label="Augmenter quantité"
                            >
                              <FiPlus size={10} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-luxury-gray hover:text-rose-500 transition-colors cursor-pointer"
                            aria-label="Supprimer l'article"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal & Action Button */}
              {cart.length > 0 && (
                <div className="border-t border-luxury-charcoal/10 pt-4 mt-6 space-y-4">
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal">
                      Sous-total
                    </span>
                    <span className="text-sm font-semibold text-luxury-gold">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <p className="text-[9px] text-luxury-gray font-sans font-light leading-relaxed">
                    Taxes incluses. Livraison calculée lors de la validation de la commande.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-3 bg-luxury-charcoal text-luxury-cream text-center text-xs uppercase tracking-widest font-sans font-medium hover:bg-luxury-gold hover:text-luxury-cream transition-colors duration-300"
                  >
                    Commander
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
