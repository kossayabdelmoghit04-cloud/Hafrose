import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../../components/ui/ProductCard/ProductCardSkeleton';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useNewArrivals } from '../../../hooks/useProductHooks';
import { useCartStore } from '../../../stores/useCartStore';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { getImageUrl } from '../../../utils/formatters';
import { Product } from '../../../types/models';

const LIMIT = 8;

export const NewArrivalsSection = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useNewArrivals(LIMIT);
  const { addItem: addToCart } = useCartStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const products: Product[] = data?.data ?? [];

  const handleWishlistToggle = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: Date.now(),
        user_id: 0,
        product_id: product.id,
        product,
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <Section
      id="nouveautes"
      spacing="lg"
      bg="white"
      className="scroll-mt-20 md:scroll-mt-24 border-t border-neutral-150"
    >
      <Container>
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14 space-y-3">
          <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
            Nouveautés
          </p>
          <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950">
            Dernières Créations
          </h2>
          <p className="text-body-base text-neutral-500 max-w-lg mx-auto leading-relaxed">
            Les dernières pièces arrivées chez HAFROSE — alliant modernité, matières nobles et finitions d'exception.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorState
            title="Impossible de charger les nouveautés"
            message="Une erreur est survenue lors de la récupération des dernières créations."
            onRetry={() => refetch()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-12 px-4 bg-cream-50 rounded-md border border-neutral-200/60 max-w-md mx-auto space-y-4">
            <p className="font-serif text-h4 text-neutral-900">
              Nos ateliers préparent les prochaines créations
            </p>
            <p className="text-body-sm text-neutral-500">
              Les nouvelles pièces exclusives seront bientôt disponibles. Découvrez dès à présent l'ensemble de nos collections.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
              Explorer la Boutique
            </Button>
          </div>
        )}

        {/* Product Grid & CTA */}
        {!isLoading && !isError && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.sale_price}
                  imageUrl={getImageUrl(product.image_url ?? product.image ?? product.media?.[0]?.url ?? null)}
                  imageCardUrl={product.image_card_url ? getImageUrl(product.image_card_url) : undefined}
                  categoryName={product.category?.name}
                  badgeText="Nouveau"
                  isWishlisted={isWishlisted(product.id)}
                  onWishlistToggle={() => handleWishlistToggle(product)}
                  onQuickAdd={() => addToCart(product, 1)}
                  onClick={(slug) => navigate(`/product/${slug}`)}
                />
              ))}
            </div>

            {/* View All CTA */}
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/shop?sort=latest')}
              >
                Découvrir toutes les Nouveautés
              </Button>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
};
