import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import { getProductImage } from '../../utils/imageHelper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatPrice } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  
  useDocumentTitle('Validation de commande', 'Révisez votre panier et saisissez vos informations de livraison pour finaliser votre commande Hafrose.');

  const [form, setForm] = useState({
    customer: '',
    phone: '',
    address: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.customer.trim()) {
      errs.customer = 'Le nom complet est obligatoire.';
    } else if (form.customer.length > 255) {
      errs.customer = 'Le nom ne doit pas dépasser 255 caractères.';
    }

    if (!form.phone.trim()) {
      errs.phone = 'Le numéro de téléphone est obligatoire.';
    } else if (form.phone.length > 50) {
      errs.phone = 'Le numéro de téléphone ne doit pas dépasser 50 caractères.';
    }

    if (!form.address.trim()) {
      errs.address = "L'adresse de livraison est obligatoire.";
    }

    if (!form.city.trim()) {
      errs.city = 'La ville est obligatoire.';
    } else if (form.city.length > 100) {
      errs.city = 'La ville ne doit pas dépasser 100 caractères.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Panier vide',
        text: 'Votre panier est vide. Veuillez ajouter des produits avant de commander.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    
    // Format payload matching StoreOrderRequest validation constraints
    const orderData = {
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await orderService.create(orderData);
      // Backend returns structure like { success: true, message: "...", data: { ...orderDetails } }
      if (res?.success) {
        const orderDetails = res.data;
        clearCart();
        
        Swal.fire({
          title: 'Commande validée !',
          text: 'Votre commande a été enregistrée avec succès. Notre atelier prépare vos créations.',
          icon: 'success',
          confirmButtonColor: '#111111'
        }).then(() => {
          navigate('/order-confirmation', { state: { order: orderDetails } });
        });
      }
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
        Swal.fire({
          icon: 'error',
          title: 'Erreur de validation',
          text: 'Certains champs comportent des erreurs. Veuillez les corriger.',
          confirmButtonColor: '#111111'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || 'Une erreur est survenue lors de la création de la commande.',
          confirmButtonColor: '#111111'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Validation de commande', path: '/checkout' }]} />

      {/* Page Header */}
      <div className="text-center space-y-4 mb-16">
        <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
          Finaliser vos achats
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-luxury-charcoal font-light">Validation de Commande</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto my-6" />
      </div>

      <AnimatePresence mode="wait">
        {cart.length === 0 ? (
          <motion.div
            key="empty-cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <FiShoppingBag className="text-luxury-gray/30" size={64} />
            <h2 className="font-serif text-2xl text-luxury-charcoal font-light">Votre Panier est Vide</h2>
            <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed max-w-sm">
              Vous n'avez sélectionné aucune pièce d'exception pour le moment. Explorez nos collections de maroquinerie, joaillerie et horlogerie.
            </p>
            <Link to="/shop">
              <Button variant="primary" className="px-10 py-3.5 mt-4">
                Explorer la Boutique
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="cart-checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left"
          >
            {/* Left Column: Cart items and Delivery details form */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Form Section */}
              <motion.div {...fadeUp} className="bg-white border border-luxury-charcoal/5 p-8 md:p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <FiCreditCard className="text-luxury-gold" size={20} />
                  <h2 className="font-serif text-xl font-light text-luxury-charcoal">Adresse de Livraison</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Nom complet"
                    name="customer"
                    value={form.customer}
                    onChange={handleChange}
                    error={errors.customer}
                    placeholder="M. ou Mme Prénom Nom"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Téléphone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="+33 6 12 34 56 78"
                      required
                    />
                    <Input
                      label="Ville"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      error={errors.city}
                      placeholder="Paris"
                      required
                    />
                  </div>

                  <Input
                    label="Adresse complète"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="12, Avenue Montaigne"
                    required
                  />

                  <div className="pt-4 border-t border-luxury-charcoal/5">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]"
                    >
                      {isSubmitting ? 'Validation en cours...' : `Confirmer & Régler la commande`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="bg-white border border-luxury-charcoal/5 p-6 md:p-8 sticky top-28 space-y-6"
              >
                <h2 className="font-serif text-lg font-light text-luxury-charcoal pb-4 border-b border-luxury-charcoal/5">
                  Récapitulatif ({cartCount} {cartCount > 1 ? 'articles' : 'article'})
                </h2>

                {/* Cart Items List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-luxury-charcoal/5 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-20 bg-luxury-light-gray flex-shrink-0 border border-luxury-charcoal/5 overflow-hidden">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-serif text-xs font-light text-luxury-charcoal leading-tight">
                            {item.product.name}
                          </h4>
                          {item.product.material && (
                            <p className="text-[9px] tracking-wider uppercase text-luxury-gray font-sans font-light mt-1">
                              {item.product.material}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-luxury-charcoal/10 scale-90 -ml-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                            >
                              <FiMinus size={8} />
                            </button>
                            <span className="px-2 text-[10px] font-sans font-light">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-luxury-charcoal hover:text-luxury-gold transition-colors cursor-pointer"
                            >
                              <FiPlus size={8} />
                            </button>
                          </div>

                          <span className="text-xs font-sans text-luxury-gold font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0 flex items-start">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-luxury-gray hover:text-rose-500 transition-colors p-1"
                          aria-label="Supprimer de la commande"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Taxes */}
                <div className="border-t border-luxury-charcoal/5 pt-4 space-y-2">
                  <div className="flex justify-between text-xs font-sans text-luxury-gray">
                    <span>Sous-total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-luxury-gray">
                    <span>Livraison Standard</span>
                    <span className="text-[10px] uppercase tracking-wider text-green-600 font-medium">
                      Offerte
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-luxury-gray">
                    <span>Taxes (TVA incluse)</span>
                    <span>Incluses</span>
                  </div>
                  <div className="border-t border-luxury-charcoal/5 pt-4 flex justify-between font-sans">
                    <span className="text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">
                      Total
                    </span>
                    <span className="text-sm font-semibold text-luxury-gold">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-luxury-cream p-4 border border-luxury-charcoal/5 space-y-2">
                  <p className="text-[9px] tracking-wider uppercase text-luxury-gold font-sans font-semibold">
                    Services de la Maison
                  </p>
                  <p className="text-[10px] text-luxury-gray font-sans font-light leading-relaxed">
                    Livraison sécurisée contre signature, emballage cadeau raffiné signature de la Maison Hafrose, et retours offerts sous 30 jours.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
