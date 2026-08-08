import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/ui/ProductCard';
import { LinkButton } from '../../components/ui/LinkButton';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { getImageUrl } from '../../utils/formatters';

export const WishlistPage = () => {
  const { items, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const navigate = useNavigate();

  const isEmpty = items.length === 0;

  return (
    <div className="bg-cream-100 min-h-screen">
      <div className="bg-cream-200 border-b border-cream-400 py-10">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mes Favoris' },
            ]}
            className="mb-3"
          />
          <h1 className="font-serif text-h1 md:text-display-lg text-neutral-950">
            Mes Coups de Cœur
          </h1>
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {isEmpty ? (
            <div className="text-center py-20 max-w-md mx-auto space-y-5">
              <div className="w-20 h-20 rounded-full bg-rose-powder text-burgundy-500 flex items-center justify-center mx-auto shadow-hafrose-xs">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-h3 text-neutral-950">Votre liste de souhaits est vide</h2>
              <p className="text-body-base text-neutral-600 leading-relaxed">
                Explorez notre catalogue et enregistrez vos pièces préférées pour les retrouver facilement à tout moment.
              </p>
              <div className="pt-2">
                <LinkButton href="/shop" variant="primary" size="lg">
                  Découvrir la Boutique
                </LinkButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-body-base text-neutral-600">
                <strong>{items.length}</strong> article(s) sauvegardé(s)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={item.id} className="space-y-2">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        salePrice={product.sale_price}
                        imageUrl={getImageUrl(product.image ?? product.media?.[0]?.url ?? null)}
                        categoryName={product.category?.name}
                        isWishlisted={true}
                        onWishlistToggle={(id) => removeFromWishlist(id)}
                        onClick={(slug) => navigate(`/product/${slug}`)}
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          leftIcon={<ShoppingBag className="w-4 h-4" />}
                          onClick={() => addToCart(product, 1)}
                        >
                          Au Panier
                        </Button>
                        <button
                          type="button"
                          aria-label="Supprimer des favoris"
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-2.5 text-neutral-400 hover:text-error-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default WishlistPage;
