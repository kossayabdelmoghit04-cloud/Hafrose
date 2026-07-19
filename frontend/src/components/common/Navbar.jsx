import { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiSearch, FiMenu, FiX, FiHeart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

const Navbar = memo(function Navbar() {
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
      {/* Injecting CSS overrides for page layout padding-top to resolve spaces and overlaps */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .pt-32, .pt-36 {
            padding-top: 80px !important;
          }
        }
        @media (max-width: 767px) {
          .pt-32, .pt-36 {
            padding-top: 64px !important;
          }
        }
      `}} />

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center ${
          scrolled 
            ? 'bg-off-white/90 backdrop-blur-md border-b border-beige h-16 md:h-20 shadow-luxury' 
            : 'bg-gradient-to-b from-off-white/20 via-off-white/5 to-transparent border-b border-transparent h-16 md:h-24'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between relative">
          
          {/* Menu Mobile Button (Left) */}
          <button 
            type="button"
            className="md:hidden text-anthracite hover:text-rose-gold transition-colors duration-500 cursor-pointer focus-visible:outline-luxury p-2 -ml-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Navigation Links (Left on desktop) */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative font-sans text-xs uppercase tracking-[0.25em] font-medium py-1 transition-colors duration-500 ease-luxury ${
                    isActive ? 'text-rose-gold' : 'text-anthracite hover:text-rose-gold'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBorder"
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-rose-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Luxury Logo (Center) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <Link to="/" className="flex flex-col items-center">
              <span className="font-serif text-2xl md:text-3xl font-extralight tracking-[0.25em] text-anthracite select-none transition-colors duration-500">
                HAFROSE
              </span>
              <span className="hidden md:block text-[7px] tracking-[0.6em] text-rose-gold uppercase mt-0.5 ml-2 font-sans font-semibold">
                Haute Maroquinerie
              </span>
            </Link>
          </div>

          {/* Action Icons (Right) */}
          <div className="flex items-center space-x-4 md:space-x-6 z-10">
            {/* Search */}
            <button 
              className="text-anthracite hover:text-rose-gold transition-colors duration-500 cursor-pointer focus-visible:outline-luxury p-1" 
              aria-label="Recherche"
            >
              <FiSearch size={18} />
            </button>

            {/* Wishlist */}
            <Link 
              to="#" 
              className="text-anthracite hover:text-rose-gold transition-colors duration-500 cursor-pointer focus-visible:outline-luxury p-1" 
              aria-label="Favoris"
            >
              <FiHeart size={18} />
            </Link>

            {/* Shopping Bag */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative text-anthracite hover:text-rose-gold transition-colors duration-500 cursor-pointer focus-visible:outline-luxury p-1"
              aria-label="Panier"
            >
              <FiShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-gold text-off-white text-[8px] font-medium w-4 h-4 rounded-full flex items-center justify-center border border-off-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Navigation */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant="drawer-left">
        <Modal.Backdrop className="md:hidden" />
        <Modal.Container className="md:hidden bg-off-white p-8 border-r border-beige">
          <div className="space-y-8 flex flex-col h-full justify-between">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-beige pb-6">
                <span className="font-serif text-xl tracking-[0.25em] text-anthracite select-none">
                  HAFROSE
                </span>
                <Modal.CloseButton className="static text-anthracite hover:text-rose-gold transition-colors duration-500 p-2" />
              </div>

              <div className="flex flex-col space-y-2 mt-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center h-12 px-2 font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-500 ${
                        isActive 
                          ? 'text-rose-gold border-l-2 border-rose-gold pl-3' 
                          : 'text-anthracite hover:text-rose-gold border-l-2 border-transparent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-beige pt-6 space-y-4">
              <p className="text-[9px] tracking-widest uppercase text-warm-gray text-center font-sans">
                Maison de Luxe Parisienne
              </p>
              <Button
                to="/shop"
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setIsOpen(false)}
              >
                Explorer
              </Button>
            </div>
          </div>
        </Modal.Container>
      </Modal>

      {/* Cart Drawer */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} variant="drawer-right">
        <Modal.Backdrop className="bg-anthracite/30 backdrop-blur-xs z-40" />
        <Modal.Container className="bg-off-white shadow-luxury-lg z-50 flex flex-col p-6 border-l border-beige sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-beige pb-4 mb-6">
            <Modal.Title className="font-serif text-lg tracking-wider text-anthracite">
              Votre Panier ({cartCount})
            </Modal.Title>
            <Modal.CloseButton className="static text-anthracite hover:text-rose-gold transition-colors duration-500 p-2" />
          </div>

          {/* Cart Items List */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <FiShoppingBag className="text-warm-gray/30" size={48} />
                <p className="text-sm font-sans text-warm-gray font-light">
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
                  className="flex space-x-4 border-b border-beige pb-4"
                >
                  {/* Product Image */}
                  <div className="w-20 h-24 bg-blush flex-shrink-0 overflow-hidden border border-beige">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-xs font-light text-anthracite leading-tight">
                        {item.product.name}
                      </h4>
                      {item.product.material && (
                        <p className="text-[9px] tracking-wider uppercase text-warm-gray font-sans font-light mt-1">
                          {item.product.material}
                        </p>
                      )}
                      <p className="text-xs font-sans text-rose-gold mt-1 font-medium">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-beige bg-off-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-anthracite hover:text-rose-gold transition-colors cursor-pointer focus-visible:outline-luxury"
                          aria-label="Diminuer quantité"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="px-2 text-xs font-sans font-light text-anthracite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-anthracite hover:text-rose-gold transition-colors cursor-pointer focus-visible:outline-luxury"
                          aria-label="Augmenter quantité"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-warm-gray hover:text-rose-gold transition-colors cursor-pointer p-1.5 focus-visible:outline-luxury"
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
            <div className="border-t border-beige pt-4 mt-6 space-y-4">
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs uppercase tracking-widest font-medium text-anthracite">
                  Sous-total
                </span>
                <span className="text-sm font-semibold text-rose-gold">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-[9px] text-warm-gray font-sans font-light leading-relaxed">
                Taxes incluses. Livraison calculée lors de la validation de la commande.
              </p>
              <Button
                to="/checkout"
                variant="primary"
                fullWidth
                onClick={() => setIsCartOpen(false)}
              >
                Commander
              </Button>
            </div>
          )}
        </Modal.Container>
      </Modal>
    </>
  );
});

export default Navbar;

