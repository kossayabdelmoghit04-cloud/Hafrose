import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiLock, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import addressService from '../../services/addressService';
import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import ShippingSelector from '../../components/checkout/ShippingSelector';
import PaymentSelector from '../../components/checkout/PaymentSelector';
import { getProductImage } from '../../utils/imageHelper';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import EmptyState from '../../components/ui/EmptyState';
import Turnstile from '../../components/ui/Turnstile';
import useSEO from '../../hooks/useSEO';
import { formatPrice } from '../../utils/format';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isCustomerAuthenticated, customerUser } = useAuth();

  useSEO({
    title: 'Validation de Commande Enterprise',
    description: 'Finalisez vos achats sur la boutique officielle Maison Hafrose.',
    robots: 'noindex, nofollow',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState({ id: 'standard', name: 'Standard Colissimo', price: 0 });
  const [paymentMethod, setPaymentMethod] = useState({ id: 'card', name: 'Carte Bancaire' });

  const savedAddresses = addressService.getAll();
  const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];

  const [form, setForm] = useState({
    customer: customerUser?.name || defaultAddress?.name || '',
    phone: defaultAddress?.phone || '+33 6 12 34 56 78',
    address: defaultAddress?.address || '',
    city: defaultAddress?.city || '',
    postal_code: defaultAddress?.postal_code || '75008',
    country: defaultAddress?.country || 'France',
    website: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const turnstileRef = useRef(null);

  const finalTotal = cartTotal + (shippingMethod.price || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateShipping = () => {
    const errs = {};
    if (!form.customer.trim()) errs.customer = 'Le nom complet est obligatoire.';
    if (!form.phone.trim()) errs.phone = 'Le numéro de téléphone est obligatoire.';
    if (!form.address.trim()) errs.address = 'L\'adresse de livraison est obligatoire.';
    if (!form.city.trim()) errs.city = 'La ville est obligatoire.';
    return errs;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (cart.length === 0) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const errs = validateShipping();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!captchaToken) {
      setErrors((prev) => ({ ...prev, captcha: 'Veuillez valider le CAPTCHA.' }));
      return;
    }

    setIsSubmitting(true);
    const orderData = {
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      postal_code: form.postal_code,
      country: form.country,
      shipping_method: shippingMethod.id,
      payment_method: paymentMethod.id,
      website: form.website,
      'cf-turnstile-response': captchaToken,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await orderService.create(orderData);
      if (res?.success) {
        const orderDetails = res.data;
        clearCart();
        setCaptchaToken(null);
        turnstileRef.current?.reset();

        Swal.fire({
          title: 'Commande validée !',
          text: 'Votre commande a été enregistrée avec succès. Notre atelier prépare vos créations.',
          icon: 'success',
          confirmButtonColor: '#111111',
        }).then(() => {
          navigate('/order-confirmation', { state: { order: orderDetails } });
        });
      }
    } catch (err) {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      if (err.errors) setErrors(err.errors);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.message || 'Une erreur est survenue lors de la création de la commande.',
        confirmButtonColor: '#111111',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Checkout Enterprise', path: '/checkout' }]} />

      {/* Title */}
      <div className="text-center space-y-3 mb-6">
        <span className="text-[10px] tracking-[0.4em] text-rose-gold uppercase font-sans font-semibold">
          Achat Sécurisé
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-luxury-charcoal font-light">
          Validation de Commande
        </h1>
      </div>

      {/* Stepper */}
      <CheckoutStepper currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {cart.length === 0 ? (
        <EmptyState
          icon={<FiShoppingBag size={48} />}
          title="Votre Panier est Vide"
          description="Vous n'avez sélectionné aucune création pour le moment."
          action={<Button to="/shop" variant="primary">Explorer la Boutique</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          {/* Main Form Step Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* STEP 1 : PANIER */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="bg-off-white border border-beige p-8 space-y-6"
                >
                  <h2 className="font-serif text-xl font-light text-luxury-charcoal border-b border-beige pb-4">
                    Révision des articles ({cartCount})
                  </h2>

                  <div className="divide-y divide-beige max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-4 flex gap-4 items-center">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover border border-beige flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-sans text-xs font-semibold text-luxury-charcoal">
                            {item.product.name}
                          </h4>
                          <p className="font-sans text-[11px] text-warm-gray mt-0.5">
                            {formatPrice(item.product.price)}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-beige bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-luxury-charcoal hover:text-rose-gold"
                              >
                                <FiMinus size={10} />
                              </button>
                              <span className="px-3 text-xs font-sans font-medium">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-luxury-charcoal hover:text-rose-gold"
                              >
                                <FiPlus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-sans text-xs font-semibold text-rose-gold block mb-2">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-warm-gray hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-beige text-right">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-rose-gold transition-colors"
                    >
                      Poursuivre vers la livraison →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 : LIVRAISON */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="bg-off-white border border-beige p-8 space-y-6"
                >
                  <h2 className="font-serif text-xl font-light text-luxury-charcoal border-b border-beige pb-4">
                    Adresse & Mode de Livraison
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                        Nom complet du destinataire <span className="text-rose-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer"
                        value={form.customer}
                        onChange={handleChange}
                        required
                        className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                      />
                      {errors.customer && <p className="text-red-500 text-[10px] mt-1">{errors.customer}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                          Téléphone mobile <span className="text-rose-gold">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                          Ville <span className="text-rose-gold">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                        />
                        {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                        Adresse complète <span className="text-rose-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                      />
                      {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
                    </div>
                  </div>

                  <ShippingSelector
                    cartTotal={cartTotal}
                    selectedMethod={shippingMethod.id}
                    onSelect={(m) => setShippingMethod(m)}
                  />

                  <div className="flex justify-between items-center pt-4 border-t border-beige">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-luxury-charcoal"
                    >
                      ← Retour au panier
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-rose-gold transition-colors"
                    >
                      Poursuivre vers le paiement →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 : PAIEMENT */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="bg-off-white border border-beige p-8 space-y-6"
                >
                  <h2 className="font-serif text-xl font-light text-luxury-charcoal border-b border-beige pb-4">
                    Règlement & Confirmation
                  </h2>

                  <PaymentSelector
                    selectedMethod={paymentMethod.id}
                    onSelect={(m) => setPaymentMethod(m)}
                  />

                  {/* Turnstile Captcha */}
                  <div className="flex flex-col items-center justify-center my-4">
                    <Turnstile
                      ref={turnstileRef}
                      onVerify={(token) => {
                        setCaptchaToken(token);
                        setErrors((prev) => ({ ...prev, captcha: null }));
                      }}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                    />
                    {errors.captcha && <p className="text-red-500 text-xs font-sans mt-1">{errors.captcha}</p>}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-beige">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-luxury-charcoal"
                    >
                      ← Retour à la livraison
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-rose-gold disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? 'Validation en cours…' : `Confirmer & Régler ${formatPrice(finalTotal)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-off-white border border-beige p-8 sticky top-28 space-y-6">
              <h3 className="font-serif text-lg font-light text-luxury-charcoal border-b border-beige pb-4">
                Récapitulatif de Commande
              </h3>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-warm-gray">
                  <span>Sous-total ({cartCount} articles)</span>
                  <span className="text-luxury-charcoal">{formatPrice(cartTotal)}</span>
                </div>

                <div className="flex justify-between text-warm-gray">
                  <span>Livraison ({shippingMethod.name})</span>
                  <span className="text-emerald-700 font-medium">
                    {shippingMethod.price === 0 ? 'Offerte' : formatPrice(shippingMethod.price)}
                  </span>
                </div>

                <div className="flex justify-between text-warm-gray">
                  <span>TVA (20% incluse)</span>
                  <span>Incluses</span>
                </div>

                <div className="border-t border-beige pt-3 flex justify-between font-semibold text-sm">
                  <span className="uppercase tracking-widest text-luxury-charcoal">Total à régler</span>
                  <span className="text-rose-gold">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="bg-white border border-beige p-4 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                  <FiLock size={12} /> Paiement 100% Sécurisé
                </div>
                <p className="font-sans text-[10px] text-warm-gray font-light leading-relaxed">
                  Cryptage SSL 256-bit garanti par la Maison Hafrose.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
