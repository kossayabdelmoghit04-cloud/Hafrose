import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../../components/ui/ProductCard/ProductCardSkeleton';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useFeaturedProducts } from '../../../hooks/useProductHooks';
import { useCartStore } from '../../../stores/useCartStore';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { getImageUrl } from '../../../utils/formatters';
import { Product } from '../../../types/models';

const VISIBLE = 4;

export const BestSellersSection = () => {
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useFeaturedProducts(8);
  const { addItem: addToCart } = useCartStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const products: Product[] = data?.data ?? [];
  const maxOffset = Math.max(0, products.length - VISIBLE);
  const visible = products.slice(offset, offset + VISIBLE);

  const handleWishlistToggle = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: Date.now(), user_id: 0, product_id: product.id, product, created_at: new Date().toISOString() });
    }
  };

  return (
    <Section spacing="lg" bg="cream-dark">
      <Container>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div className="space-y-3">
            <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
              Sélection du Moment
            </p>
            <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950 leading-tight">
              Meilleures Ventes
            </h2>
          </div>
          {!isLoading && !isError && products.length > VISIBLE && (
            <div className="flex items-center gap-2 flex-shrink-0 pb-1">
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Articles précédents"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 1))}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Articles suivants"
                disabled={offset >= maxOffset}
                onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: VISIBLE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorState
            title="Impossible de charger les produits"
            message="Une erreur est survenue lors du chargement des meilleures ventes."
            onRetry={() => refetch()}
          />
        )}

        {/* Product Grid */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {visible.map((product) => (
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
                  badgeText={product.is_featured ? 'Best-seller' : undefined}
                  isWishlisted={isWishlisted(product.id)}
                  onWishlistToggle={() => handleWishlistToggle(product)}
                  onQuickAdd={() => addToCart(product, 1)}
                  onClick={(slug) => navigate(`/product/${slug}`)}
                />
              ))}
            </div>

            {/* View All CTA */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={() => navigate('/shop')}>
                Voir toutes les Meilleures Ventes
              </Button>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
};
