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
import { formatPrice } from '../../utils/formatters';

export const CheckoutPage = () => {
  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
    shippingMethod: 'express',
    paymentMethod: 'card',
    saveInfo: true,
  });

  const subtotal = 56500;
  const shipping = formData.shippingMethod === 'express' ? 0 : 1500;
  const total = subtotal + shipping;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('confirmed');
  };

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
                  Commande N° HF-849201
                </span>
                <h1 className="font-serif text-h1 text-neutral-950">
                  Merci pour Votre Commande
                </h1>
                <p className="text-body-base text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Votre commande a été validée avec succès. Un e-mail de confirmation a été envoyé à votre adresse.
                </p>
              </div>

              <div className="p-4 bg-cream-100 rounded-sm text-left text-body-sm space-y-1">
                <p className="font-semibold text-neutral-900">Adresse de Livraison :</p>
                <p className="text-neutral-600">{formData.firstName} {formData.lastName}</p>
                <p className="text-neutral-600">{formData.address}, {formData.postalCode} {formData.city}</p>
              </div>

              <div className="pt-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                  Retourner à l'Accueil
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
                    { value: 'FR', label: 'France' },
                    { value: 'BE', label: 'Belgique' },
                    { value: 'LU', label: 'Luxembourg' },
                    { value: 'CH', label: 'Suisse' },
                    { value: 'MA', label: 'Maroc' },
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
                    label="Chronopost Coursier VIP (Le jour même à Paris)"
                    description="15,00 € supplémentaires"
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

                {formData.paymentMethod === 'card' && (
                  <div className="p-4 bg-cream-100 rounded-sm space-y-3 mt-2">
                    <Input label="Numéro de carte" placeholder="1234 5678 9012 3456" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Date d'expiration" placeholder="MM/YY" />
                      <Input label="Cryptogramme (CVC)" placeholder="123" />
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5">
              <Card className="p-6 bg-white space-y-5 sticky top-24">
                <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
                  Récapitulatif de Commande
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-neutral-600">Sous-total (2 articles)</span>
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
                  checked={formData.saveInfo}
                  onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth leftIcon={<ShieldCheck className="w-5 h-5" />}>
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
