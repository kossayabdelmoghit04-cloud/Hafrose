import { useState, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi';
import { getProductImage, getProductGallery } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';
import Card from '../ui/Card';
import QuickViewModal from '../common/QuickViewModal';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

/**
 * ProductCard — HAFROSE Design System Phase 3
 * Carte produit V2 avec double image au survol, wishlist animée,
 * aperçu rapide en modale, badges intelligents et bouton Quick Add.
 */
function ProductCard({ product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isAvailable = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const isFeatured = product.is_featured;
  const isWishlisted = isInWishlist(product.id);

  // Récupérer la galerie pour la double image au survol
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const primaryImg = gallery[0] || getProductImage(product);
  const secondaryImg = gallery[1] || null;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable) addToCart(product, 1);
  };

  return (
    <>
      <Card
        as={Link}
        to={`/product/${product.slug}`}
        variant="product"
        size="md"
        aria-label={product.name}
        className="group relative flex flex-col justify-between"
      >
        {/* ── Badges intelligents haut gauche ── */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {isFeatured && <Card.Badge variant="featured" position="static">Exclusif</Card.Badge>}
          {isLowStock && <Card.Badge variant="pending" position="static">Dernières Pièces</Card.Badge>}
          {!isAvailable && <Card.Badge variant="unavailable" position="static">Rupture</Card.Badge>}
        </div>

        {/* ── Bouton Wishlist haut droite ── */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
            isWishlisted
              ? 'bg-off-white text-rose-gold shadow-md scale-110'
              : 'bg-off-white/80 text-warm-gray hover:text-rose-gold hover:bg-off-white'
          }`}
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <motion.div
            whileTap={{ scale: 0.7 }}
            animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiHeart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </motion.div>
        </button>

        {/* ── Image Container avec Double Image Hover ── */}
        <Card.Media ratio="3/4" className="relative overflow-hidden bg-blush">
          {/* Primary Image */}
          <img
            src={primaryImg}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 ease-luxury ${
              secondaryImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
          />

          {/* Secondary Image (fade in on hover) */}
          {secondaryImg && (
            <img
              src={secondaryImg}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-luxury"
            />
          )}

          {/* ── Action Overlay On Hover (Desktop) ── */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-anthracite/60 via-anthracite/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="bg-off-white/95 text-anthracite hover:text-rose-gold font-sans text-[10px] font-medium tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FiEye size={13} />
              <span>Aperçu</span>
            </button>

            {isAvailable && (
              <button
                type="button"
                onClick={handleQuickAddClick}
                className="bg-rose-gold text-off-white hover:bg-rose-gold-dark font-sans text-[10px] font-medium tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FiShoppingBag size={13} />
                <span>+ Panier</span>
              </button>
            )}
          </div>
        </Card.Media>

        {/* ── Détails Produit ── */}
        <Card.Body className="p-card-md text-center">
          <Card.Content className="gap-1">
            {product.material && (
              <Card.Meta>{product.material}</Card.Meta>
            )}
            <Card.Title className="group-hover:text-rose-gold transition-colors duration-300">
              {product.name}
            </Card.Title>
          </Card.Content>

          <Card.Footer className="justify-center gap-2 border-t border-card-border-editorial pt-3 mt-2">
            <Card.Price>{formatPrice(product.price)}</Card.Price>
          </Card.Footer>
        </Card.Body>
      </Card>

      {/* Modale d'Aperçu Rapide */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default memo(ProductCard);
