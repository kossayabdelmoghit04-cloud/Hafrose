import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiTag,
  FiCheck,
  FiTruck,
} from 'react-icons/fi';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { useCart } from '../../../context/CartContext';
import { getProductImage } from '../../../utils/imageHelper';
import { formatPrice } from '../../../utils/format';

const FREE_SHIPPING_THRESHOLD = 150;

const PROMO_CODES = {
  HAFROSE10: { discount: 0.10, label: '−10%' },
  BIENVENUE: { discount: 0.15, label: '−15%' },
  MAISON20:  { discount: 0.20, label: '−20%' },
};

const CartDrawer = memo(function CartDrawer({ isOpen, onClose }) {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              <Button variant="primary" size="sm" onClick={onClose}>
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

        {cart.length > 0 && (
          <div className="cart-drawer__footer">
            {/* Barre livraison gratuite */}
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

            {/* Code Promo */}
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

            {/* Totaux */}
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
              onClick={onClose}
            >
              Commander — {formatPrice(finalTotal)}
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="cart-drawer__continue"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </Modal.Container>
    </Modal>
  );
});

export default CartDrawer;
