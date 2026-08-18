import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, CreditCard } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Radio } from '../../components/ui/Radio';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { Alert } from '../../components/ui/Alert';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCreateOrder } from '../../hooks/useAccountHooks';
import { Order } from '../../types/models';
import { useSEO } from '../../hooks/useSEO';

export const CheckoutPage = () => {
  useSEO({ title: 'Commande | HAFROSE', noIndex: true });
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const createOrderMutation = useCreateOrder();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Maroc',
    shippingMethod: 'express',
    paymentMethod: 'card' as 'card' | 'paypal' | 'cod',
    acceptTerms: false,
  });

  const subtotal = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const shipping = formData.shippingMethod === 'vip' ? 15 : 0;
  const total = subtotal + shipping;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!formData.acceptTerms) {
      setFormError('Veuillez accepter les Conditions Générales de Vente.');
      return;
    }
    if (items.length === 0) {
      setFormError('Votre panier est vide.');
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        customer: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
        shipping_amount: shipping,
        shipping_method: formData.shippingMethod,
        payment_method: formData.paymentMethod,
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: formData.country,
        },
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          size: i.selected_size,
          color: i.selected_color,
        })),
      });

      setCreatedOrder(order);
      clearCart();
      setStep('confirmed');
    } catch (err: any) {
      const msg = err?.message || (err?.errors ? Object.values(err.errors).flat().join(' ') : null);
      setFormError(msg || 'Une erreur s\'est produite lors de la création de votre commande. Veuillez réessayer.');
    }
  };

  if (step === 'form' && items.length === 0) {
    return (
      <div className="bg-cream-100 min-h-screen">
        <Section spacing="xl">
          <Container size="sm">
            <Card className="p-8 md:p-12 text-center space-y-5 bg-white shadow-hafrose-card">
              <h2 className="font-serif text-h2 text-neutral-950">Votre panier est vide</h2>
              <p className="text-body-base text-neutral-600">
                Vous n'avez aucun article dans votre panier à commander.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="lg" onClick={() => navigate('/shop')}>
                  Découvrir la Collection
                </Button>
              </div>
            </Card>
          </Container>
        </Section>
      </div>
    );
  }

  if (step === 'confirmed') {
    return (
      <div className="bg-cream-100 min-h-screen">
        <Section spacing="xl">
          <Container size="sm">
            <Card className="p-8 md:p-12 text-center space-y-6 bg-white shadow-hafrose-modal">
              <div className="w-16 h-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto border border-success-100 animate-scale-up">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-burgundy-500">
                  Commande N° {createdOrder?.order_number || 'HF-849201'}
                </span>
                <h1 className="font-serif text-h1 text-neutral-950">
                  Merci pour Votre Commande
                </h1>
                <p className="text-body-base text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Votre commande a été validée avec succès. Un e-mail de confirmation a été envoyé à <strong>{formData.email}</strong>.
                </p>
              </div>

              <div className="p-4 bg-cream-100 rounded-sm text-left text-body-sm space-y-1">
                <p className="font-semibold text-neutral-900">Adresse de Livraison :</p>
                <p className="text-neutral-600">{formData.firstName} {formData.lastName}</p>
                <p className="text-neutral-600">{formData.address}, {formData.postalCode} {formData.city}</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {createdOrder?.id ? (
                  <Button variant="primary" size="lg" onClick={() => navigate(`/account/orders/${createdOrder.id}`)}>
                    Consulter la Commande
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={() => navigate('/account/orders')}>
                    Mes Commandes
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                  Retour à l'Accueil
                </Button>
              </div>
            </Card>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 min-h-screen">
      <div className="bg-cream-200 border-b border-cream-400 py-8">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Panier', href: '/cart' },
              { label: 'Paiement Sécurisé' },
            ]}
            className="mb-2"
          />
          <h1 className="font-serif text-h1 text-neutral-950 flex items-center gap-3">
            <Lock className="w-6 h-6 text-burgundy-500" /> Commande Sécurisée HAFROSE
          </h1>
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {formError && (
            <Alert variant="error" title="Erreur de validation" className="mb-6">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Steps Column */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Address Section */}
              <Card className="p-6 bg-white space-y-4">
                <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
                  1. Informations & Adresse de Livraison
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <Input
                    label="Nom"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="E-mail"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <Input
                  label="Adresse de rue"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Code Postal"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                  <div className="col-span-2">
                    <Input
                      label="Ville"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <Select
                  label="Pays / Région"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  options={[
                    { value: 'Maroc', label: 'Maroc' },
                    { value: 'Algérie', label: 'Algérie' },
                    { value: 'Tunisie', label: 'Tunisie' },
                    { value: 'France', label: 'France' },
                    { value: 'Belgique', label: 'Belgique' },
                    { value: 'Luxembourg', label: 'Luxembourg' },
                    { value: 'Suisse', label: 'Suisse' },
                  ]}
                />
              </Card>

              {/* 2. Shipping Options */}
              <Card className="p-6 bg-white space-y-4">
                <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
                  2. Mode de Livraison
                </h3>
                <div className="space-y-3">
                  <Radio
                    name="shipping"
                    label="Livraison Express HAFROSE (24h-48h) — Offerte"
                    description="Remise en main propre contre signature"
                    checked={formData.shippingMethod === 'express'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'express' })}
                  />
                  <Radio
                    name="shipping"
                    label="Chronopost Coursier VIP (Le jour même)"
                    description="15,00 MAD supplémentaires"
                    checked={formData.shippingMethod === 'vip'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'vip' })}
                  />
                </div>
              </Card>

              {/* 3. Payment Method */}
              <Card className="p-6 bg-white space-y-4">
                <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3 flex items-center justify-between">
                  <span>3. Mode de Paiement</span>
                  <CreditCard className="w-5 h-5 text-burgundy-500" />
                </h3>
                <div className="space-y-3">
                  <Radio
                    name="payment"
                    label="Carte Bancaire (Visa, Mastercard, Amex)"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  />
                  <Radio
                    name="payment"
                    label="PayPal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                  />
                  <Radio
                    name="payment"
                    label="Paiement à la Livraison"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  />
                </div>
              </Card>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5">
              <Card className="p-6 bg-white space-y-5 sticky top-24">
                <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
                  Récapitulatif de Commande
                </h3>

                {/* Liste des articles */}
                <div className="space-y-3 mb-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-14 flex-shrink-0 rounded-xs bg-cream-100 overflow-hidden border border-neutral-100">
                        <img
                          src={getImageUrl(item.product.image ?? item.product.media?.[0]?.url ?? null)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-neutral-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-caption text-neutral-400">Qté : {item.quantity}</p>
                      </div>
                      <span className="text-body-sm font-semibold text-neutral-900 flex-shrink-0">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-neutral-600">Sous-total ({items.length} article(s))</span>
                    <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-neutral-600">Frais de livraison</span>
                    <span className="font-medium text-success-600">
                      {shipping === 0 ? 'Offerts' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <Divider spacing="none" />

                <div className="flex justify-between items-baseline">
                  <span className="font-serif text-h4 text-neutral-950">Total TTC</span>
                  <span className="font-sans text-h3 font-semibold text-burgundy-600">
                    {formatPrice(total)}
                  </span>
                </div>

                <Checkbox
                  label="J'accepte les Conditions Générales de Vente"
                  required
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={createOrderMutation.isPending}
                  leftIcon={<ShieldCheck className="w-5 h-5" />}
                >
                  Confirmer et Payer {formatPrice(total)}
                </Button>

                <p className="text-caption text-neutral-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Paiement chiffré SSL 256 bits
                </p>
              </Card>
            </div>
          </form>
        </Container>
      </Section>
    </div>
  );
};

export default CheckoutPage;
