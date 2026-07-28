import { useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiHeart, FiMinus, FiPlus, FiArrowRight, FiCheck } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductGallery, getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

/**
 * QuickViewModal — HAFROSE Design System Phase 3
 * Modale d'aperçu rapide produit avec sélecteur d'image, quantité et ajout direct au panier.
 */

const QuickViewModal = memo(function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const gallery = getProductGallery(product);
  const isAvailable = product.stock > 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, qty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="default" size="lg">
      <Modal.Backdrop className="bg-anthracite/50 backdrop-blur-sm" />
      <Modal.Container className="bg-off-white relative border border-beige max-w-3xl overflow-hidden p-0">
        <Modal.CloseButton className="z-20 top-4 right-4" />

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ── Galerie image gauche ── */}
          <div className="bg-blush relative aspect-square md:aspect-auto flex flex-col justify-between p-4">
            <div className="relative w-full h-[280px] md:h-[380px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImgIdx}
                  src={gallery[activeImgIdx] || getProductImage(product)}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 justify-center mt-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-12 h-14 border transition-all ${
                      idx === activeImgIdx ? 'border-rose-gold scale-105' : 'border-beige opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Détails produit droite ── */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-warm-gray">
                  {product.material || 'Haute Maroquinerie'}
                </span>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2 transition-colors ${isWishlisted ? 'text-rose-gold' : 'text-warm-gray hover:text-rose-gold'}`}
                  aria-label="Ajouter aux favoris"
                >
                  <FiHeart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>

              <h3 className="font-serif text-xl md:text-2xl text-anthracite mt-1 font-light">
                {product.name}
              </h3>

              <p className="font-sans text-lg font-medium text-rose-gold mt-2">
                {formatPrice(product.price)}
              </p>

              <p className="font-sans text-xs font-light text-warm-gray mt-3 line-clamp-3 leading-relaxed">
                {product.description || 'Une création d\'exception façonnée à la main dans les plus nobles matières.'}
              </p>

              {/* Statut Stock */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-red-500'}`} />
                <span className="font-sans text-[10px] tracking-wider uppercase font-medium text-anthracite">
                  {isAvailable ? `En Stock (${product.stock} disponibles)` : 'Rupture de Stock'}
                </span>
              </div>
            </div>

            {/* Contrôles & CTA */}
            <div className="mt-6 pt-6 border-t border-beige space-y-4">
              {isAvailable && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-beige bg-off-white">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-2 text-anthracite hover:text-rose-gold"
                      aria-label="Moins"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="px-3 font-sans text-xs font-medium">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="p-2 text-anthracite hover:text-rose-gold"
                      aria-label="Plus"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleAddToCart}
                  >
                    {addedToast ? (
                      <span className="flex items-center gap-2">
                        <FiCheck size={14} /> Ajouté !
                      </span>
                    ) : (
                      'Ajouter au Panier'
                    )}
                  </Button>
                </div>
              )}

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-xs font-sans font-medium uppercase tracking-widest text-warm-gray hover:text-rose-gold transition-colors pt-2"
              >
                <span>Voir la fiche complète</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </Modal.Container>
    </Modal>
  );
});

export default QuickViewModal;
