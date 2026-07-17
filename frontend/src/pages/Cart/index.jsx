import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import { getProductImage } from '../../utils/imageHelper';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatPrice } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card from '../../components/ui/Card';
import { Form, Input } from '../../components/ui/form';
import EmptyState from '../../components/ui/EmptyState';
import Turnstile from '../../components/ui/Turnstile';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  useDocumentTitle('Validation de commande', 'Révisez votre panier et saisissez vos informations de livraison pour finaliser votre commande Hafrose.');

  const [form, setForm] = useState({
    customer: '',
    phone: '',
    address: '',
    city: '',
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const turnstileRef = useRef(null);

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

    if (!captchaToken) {
      errs.captcha = 'Veuillez valider le CAPTCHA.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      website: form.website,
      'cf-turnstile-response': captchaToken,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
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
          confirmButtonColor: '#111111'
        }).then(() => {
          navigate('/order-confirmation', { state: { order: orderDetails } });
        });
      }
    } catch (err) {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EmptyState
              icon={<FiShoppingBag size={48} />}
              title="Votre Panier est Vide"
              description="Vous n'avez sélectionné aucune pièce d'exception pour le moment. Explorez nos collections de maroquinerie, joaillerie et horlogerie."
              action={
                <Button to="/shop" variant="primary">
                  Explorer la Boutique
                </Button>
              }
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Left Column: Cart items and Delivery details form */}
            <div className="lg:col-span-7 space-y-10">

              {/* Form Section */}
              <Card
                variant="panel"
                className="p-8 md:p-10"
                initial="initial"
                animate="animate"
                variants={fadeUp}
              >
                <Card.Header className="flex items-center space-x-3 mb-8 border-b-0 pb-0">
                  <FiCreditCard className="text-luxury-gold" size={20} />
                  <Card.Title as="h2" className="text-xl font-light">Adresse de Livraison</Card.Title>
                </Card.Header>

                <Form onSubmit={handleSubmit}>
                  {/* Honeypot anti-spam field - hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <Form.Section>
                    {/* Nom complet — full width */}
                    <Form.Field name="customer" error={errors.customer}>
                      <Form.Label required>Nom complet</Form.Label>
                      <Input
                        name="customer"
                        value={form.customer}
                        onChange={handleChange}
                        placeholder="M. ou Mme Prénom Nom"
                        required
                        autoComplete="name"
                      />
                      <Form.Error />
                    </Form.Field>

                    {/* Row: Téléphone + Ville */}
                    <Form.Row cols={{ default: 1, md: 2 }}>
                      <Form.Field name="phone" error={errors.phone}>
                        <Form.Label required>Téléphone</Form.Label>
                        <Input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+33 6 12 34 56 78"
                          required
                          autoComplete="tel"
                        />
                        <Form.Error />
                      </Form.Field>

                      <Form.Field name="city" error={errors.city}>
                        <Form.Label required>Ville</Form.Label>
                        <Input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Paris"
                          required
                          autoComplete="address-level2"
                        />
                        <Form.Error />
                      </Form.Field>
                    </Form.Row>

                    {/* Adresse complète — full width */}
                    <Form.Field name="address" error={errors.address}>
                      <Form.Label required>Adresse complète</Form.Label>
                      <Input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="12, Avenue Montaigne"
                        required
                        autoComplete="street-address"
                      />
                      <Form.Error />
                    </Form.Field>

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
                      {errors.captcha && (
                        <p className="text-red-500 text-xs font-sans mt-1">{errors.captcha}</p>
                      )}
                    </div>
                  </Form.Section>

                  <Form.Footer>
                    <Form.Actions align="left">
                      <Button
                        variant="primary"
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Validation en cours...' : `Confirmer & Régler la commande`}
                      </Button>
                    </Form.Actions>
                  </Form.Footer>
                </Form>
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <Card
                variant="panel"
                className="sticky top-28 p-6 md:p-8"
                initial="initial"
                animate="animate"
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <Card.Header className="border-b border-luxury-charcoal/5 pb-4 mb-0">
                  <Card.Title as="h2" className="text-lg font-light">
                    Récapitulatif ({cartCount} {cartCount > 1 ? 'articles' : 'article'})
                  </Card.Title>
                </Card.Header>

                {/* Cart Items List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-luxury-charcoal/5 pr-1">
                  {cart.map((item) => (
                    <Card
                      key={item.product.id}
                      variant="flat"
                      className="py-4 flex gap-4 first:pt-0 last:pb-0 p-0 border-0 shadow-none text-left"
                    >
                      {/* Product Thumbnail */}
                      <Card.Media ratio="3/4" className="w-16 h-20 flex-shrink-0 border border-luxury-charcoal/5">
                        <Card.Image
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          zoom={false}
                        />
                      </Card.Media>

                      {/* Info & Quantity controls */}
                      <Card.Body className="flex-grow flex flex-col justify-between py-0.5 p-0 bg-transparent gap-1">
                        <Card.Content className="gap-1 p-0">
                          <Card.Title as="h4" className="text-xs font-light text-luxury-charcoal leading-tight">
                            {item.product.name}
                          </Card.Title>
                          {item.product.material && (
                            <Card.Meta className="mt-0.5">
                              {item.product.material}
                            </Card.Meta>
                          )}
                        </Card.Content>

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

                          <Card.Price className="text-xs">
                            {formatPrice(item.product.price * item.quantity)}
                          </Card.Price>
                        </div>
                      </Card.Body>

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
                    </Card>
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
                <Card variant="service" className="bg-card-bg-editorial p-4 border border-card-border-editorial text-left gap-1">
                  <p className="text-[9px] tracking-wider uppercase text-luxury-gold font-sans font-semibold">
                    Services de la Maison
                  </p>
                  <p className="text-[10px] text-luxury-gray font-sans font-light leading-relaxed">
                    Livraison sécurisée contre signature, emballage cadeau raffiné signature de la Maison Hafrose, et retours offerts sous 30 jours.
                  </p>
                </Card>
              </Card>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
