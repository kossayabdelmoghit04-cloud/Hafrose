import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiHeart,
  FiMinus,
  FiPlus,
  FiCheck,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/format';

/**
 * ProductBuyBox — HAFROSE Design System Phase 3
 * Fiche d'achat avec sélecteur dynamique de variantes, calcul d'économies,
 * barre d'urgence stock, réassurance luxe et Sticky Buy Box au défilement.
 */

const DEFAULT_COLORS = [
  { id: 'black', name: 'Noir Ébène', hex: '#111111' },
  { id: 'cognac', name: 'Cognac', hex: '#9E5A2A' },
  { id: 'rose', name: 'Rose Poudré', hex: '#F4C2C2' },
  { id: 'emerald', name: 'Vert Émeraude', hex: '#046307' },
];

const ProductBuyBox = memo(function ProductBuyBox({ product, onOpenAppointment, onOpenGiftModal }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(product?.material || 'Cuir de veau grainé');
  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const buyBoxRef = useRef(null);

  // All hooks must be declared before conditional returns (rules-of-hooks)
  const isWishlisted = isInWishlist(product?.id);
  const isAvailable = product ? product.stock > 0 : false;
  const isLowStock = product ? product.stock > 0 && product.stock <= 3 : false;

  // Détecter si la BuyBox principale est sortie de l'écran pour afficher la Sticky Bar
  useEffect(() => {
    if (!product) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking && buyBoxRef.current) {
        window.requestAnimationFrame(() => {
          const rect = buyBoxRef.current?.getBoundingClientRect();
          if (rect) setShowStickyBar(rect.bottom < 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!isAvailable) return;
    // Produit enrichi avec les variantes choisies
    const variantProduct = {
      ...product,
      selectedColor: selectedColor.name,
      selectedMaterial: selectedMaterial,
    };
    addToCart(variantProduct, qty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  }, [addToCart, isAvailable, product, qty, selectedColor, selectedMaterial]);

  // Guard must come after all hooks
  if (!product) return null;

  return (
    <div ref={buyBoxRef} className="flex flex-col gap-6">

      {/* ── Entête & Titre ── */}
      <div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase text-rose-gold">
            {product.category?.name || 'Haute Maroquinerie'}
          </span>
          <span className="font-sans text-[10px] text-warm-gray tracking-wider uppercase">
            SKU: HAF-{product.id}-2026
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-anthracite font-light mt-1">
          {product.name}
        </h1>

        {/* Prix & Économies */}
        <div className="flex items-baseline gap-3 mt-3">
          <span className="font-sans text-2xl font-medium text-rose-gold">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <>
              <span className="font-sans text-sm text-warm-gray line-through">
                {formatPrice(product.original_price)}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-sans text-[9px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 bg-anthracite text-luxury-gold border border-luxury-gold/30"
              >
                −{formatPrice(product.original_price - product.price)}
              </motion.span>
            </>
          )}
        </div>
      </div>

      {/* ── Urgence Stock ── */}
      {isLowStock && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-none text-amber-900 flex items-center justify-between">
          <span className="font-sans text-xs font-medium">
            Attention : Plus que {product.stock} exemplaires en stock !
          </span>
          <div className="w-20 bg-amber-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Sélecteur de Couleur (Variante) ── */}
      <div className="space-y-2">
        <label className="font-sans text-xs uppercase tracking-widest font-medium text-anthracite block">
          Couleur : <span className="text-warm-gray font-normal">{selectedColor.name}</span>
        </label>
        <div className="flex gap-3">
          {DEFAULT_COLORS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setSelectedColor(col)}
              className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                selectedColor.id === col.id ? 'border-rose-gold scale-110' : 'border-beige hover:border-warm-gray'
              }`}
              title={col.name}
            >
              <span className="block w-full h-full rounded-full" style={{ backgroundColor: col.hex }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Sélecteur de Matière ── */}
      {product.material && (
        <div className="space-y-2">
          <label className="font-sans text-xs uppercase tracking-widest font-medium text-anthracite block">
            Matière : <span className="text-warm-gray font-normal">{selectedMaterial}</span>
          </label>
          <div className="p-3 border border-beige bg-off-white font-sans text-xs text-anthracite font-light">
            {product.material} — Cuir sélectionné à la main
          </div>
        </div>
      )}

      {/* ── Quantité & CTA Ajout Panier ── */}
      <div className="space-y-4 pt-2">
        {isAvailable ? (
          <div className="flex items-center gap-4">
            {/* Moins / Plus */}
            <div className="flex items-center border border-beige bg-off-white h-12 px-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-2 text-anthracite hover:text-rose-gold transition-colors"
                aria-label="Diminuer la quantité"
              >
                <FiMinus size={14} />
              </button>
              <span className="px-4 font-sans text-sm font-medium text-anthracite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="p-2 text-anthracite hover:text-rose-gold transition-colors"
                aria-label="Augmenter la quantité"
              >
                <FiPlus size={14} />
              </button>
            </div>

            {/* Bouton Ajouter au Panier */}
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToCart}
              className="h-12 relative overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {addedToast ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 absolute inset-0 justify-center"
                  >
                    <FiCheck size={16} /> Ajouté au Panier
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 absolute inset-0 justify-center"
                  >
                    <FiShoppingBag size={16} /> Ajouter au Panier
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Bouton Wishlist */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`h-12 w-12 flex items-center justify-center border transition-all ${
                isWishlisted
                  ? 'border-rose-gold text-rose-gold bg-blush'
                  : 'border-beige text-warm-gray hover:text-rose-gold hover:border-rose-gold bg-off-white'
              }`}
              aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <FiHeart size={18} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
        ) : (
          <Button variant="secondary" fullWidth disabled>
            Produit Indisponible
          </Button>
        )}

        {/* Free shipping progress */}
        {isAvailable && product.price < 150 && (
          <div className="pt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-sans text-[10px] text-warm-gray tracking-wider">
                Plus que <strong className="text-rose-gold font-medium">{formatPrice(150 - product.price * qty)}</strong> pour la livraison offerte
              </span>
              <FiTruck size={12} className="text-rose-gold" />
            </div>
            <div className="h-[2px] bg-beige overflow-hidden">
              <motion.div
                className="h-full bg-rose-gold"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (product.price * qty / 150) * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Clienteling & Services Luxe (RDV Privé & Option Cadeau) ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onOpenAppointment && (
          <button
            type="button"
            onClick={onOpenAppointment}
            className="flex-1 py-2.5 px-3 border border-luxury-gold/30 hover:border-luxury-gold text-[10px] font-medium tracking-widest uppercase text-luxury-charcoal hover:text-luxury-gold bg-luxury-cream/40 flex items-center justify-center gap-2 transition-all"
          >
            <span>Réserver un RDV Privé</span>
          </button>
        )}
        {onOpenGiftModal && (
          <button
            type="button"
            onClick={onOpenGiftModal}
            className="flex-1 py-2.5 px-3 border border-beige hover:border-luxury-gold text-[10px] font-medium tracking-widest uppercase text-luxury-gray hover:text-luxury-charcoal bg-white flex items-center justify-center gap-2 transition-all"
          >
            <span>Écrin Cadeau Offert</span>
          </button>
        )}
      </div>

      {/* ── Réassurance Luxe (Trust Badges) ── */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-beige">
        <div className="flex items-center gap-2.5">
          <FiTruck className="text-rose-gold flex-shrink-0" size={18} />
          <span className="font-sans text-[10px] uppercase tracking-wider text-anthracite font-medium">
            Livraison Offerte dès 150 €
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <FiRefreshCw className="text-rose-gold flex-shrink-0" size={18} />
          <span className="font-sans text-[10px] uppercase tracking-wider text-anthracite font-medium">
            Retours Gratuits (14j)
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <FiShield className="text-rose-gold flex-shrink-0" size={18} />
          <span className="font-sans text-[10px] uppercase tracking-wider text-anthracite font-medium">
            Paiement 100% Sécurisé
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <FiAward className="text-rose-gold flex-shrink-0" size={18} />
          <span className="font-sans text-[10px] uppercase tracking-wider text-anthracite font-medium">
            Garantie Maison Hafrose
          </span>
        </div>
      </div>

      {/* ── Sticky Buy Box Bar (Apparaît au scroll) ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-off-white/98 backdrop-blur-xl border-t border-luxury-gold/20 py-3 shadow-[0_-4px_32px_rgba(0,0,0,0.08)] hidden md:block"
          >
            <div className="max-w-7xl mx-auto px-12 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[1px] h-8 bg-luxury-gold/30" />
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-warm-gray">Maison Hafrose</p>
                  <h4 className="font-serif text-base text-anthracite leading-tight">{product.name}</h4>
                </div>
                <span className="font-sans text-sm font-semibold text-rose-gold">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 border transition-colors ${isWishlisted ? 'text-rose-gold border-rose-gold' : 'text-warm-gray border-beige hover:border-rose-gold hover:text-rose-gold'}`}
                >
                  <FiHeart size={16} className={isWishlisted ? 'fill-current' : ''} />
                </button>
                <Button variant="primary" size="sm" onClick={handleAddToCart}>
                  Ajouter au Panier
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ProductBuyBox;
