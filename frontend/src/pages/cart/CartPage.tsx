import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { NumberInput } from '../../components/ui/NumberInput';
import { LinkButton } from '../../components/ui/LinkButton';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { LazyImage } from '../../components/ui/LazyImage';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import { useCartStore } from '../../stores/useCartStore';
import { useSEO } from '../../hooks/useSEO';

export const CartPage = () => {
  useSEO({ title: 'Mon Panier | HAFROSE', noIndex: true });
  const { items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 9;
  const vat = Math.round((subtotal - (subtotal / 1.2)) * 100) / 100;
  const total = subtotal + shipping;

  return (
    <div className="bg-cream-100 min-h-screen">
      <div className="bg-cream-200 border-b border-cream-400 py-10">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mon Panier' },
            ]}
            className="mb-3"
          />
          <h1 className="font-serif text-h1 md:text-display-lg text-neutral-950">
            Mon Panier D'Achat
          </h1>
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {items.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto space-y-5">
              <div className="w-20 h-20 rounded-full bg-rose-powder text-burgundy-500 flex items-center justify-center mx-auto shadow-hafrose-xs">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-h3 text-neutral-950">Votre panier est vide</h2>
              <p className="text-body-base text-neutral-600 leading-relaxed">
                Vous n'avez pas encore ajouté de création HAFROSE à votre panier.
              </p>
              <div className="pt-2">
                <LinkButton href="/shop" variant="primary" size="lg">
                  Découvrir la Collection
                </LinkButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4 sm:p-6 bg-white">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-20 sm:w-28 aspect-[3/4] rounded-xs bg-cream-200 overflow-hidden flex-shrink-0">
                        <LazyImage
                          src={getImageUrl(item.product.image_thumb_url || item.product.image_card_url || item.product.image_url || item.product.image || item.product.media?.[0]?.url || null)}
                          alt={item.product.name}
                          width={112}
                          height={149}
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif text-h5 sm:text-h4 text-neutral-900 leading-tight">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center gap-3 text-caption text-neutral-500 mt-1">
                              {item.selected_size && <span>Taille : {item.selected_size}</span>}
                              {item.selected_color && <span>Couleur : {item.selected_color}</span>}
                            </div>
                          </div>
                          <span className="font-sans font-semibold text-body-base text-neutral-950">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <NumberInput
                            value={item.quantity}
                            onChange={(q) => updateQuantity(item.id, q)}
                            min={1}
                            max={10}
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1 text-caption text-neutral-400 hover:text-error-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4">
                <Card className="p-6 bg-white space-y-5 sticky top-24">
                  <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
                    Résumé de la Commande
                  </h3>

                  <div className="space-y-3 text-body-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Sous-total</span>
                      <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Livraison estimée</span>
                      <span className="font-medium text-neutral-900">
                        {shipping === 0 ? <span className="text-success-600">Gratuite</span> : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 text-caption">
                      <span>TVA incluse (20%)</span>
                      <span>{formatPrice(vat)}</span>
                    </div>
                  </div>

                  <Divider spacing="none" />

                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-h4 text-neutral-950">Total</span>
                    <span className="font-sans text-h3 font-semibold text-burgundy-600">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <LinkButton
                    href="/checkout"
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Procéder au Paiement
                  </LinkButton>
                </Card>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default CartPage;
