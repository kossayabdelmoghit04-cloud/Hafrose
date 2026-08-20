import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../../components/ui/ProductCard/ProductCardSkeleton';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useProducts } from '../../../hooks/useProductHooks';
import { useCartStore } from '../../../stores/useCartStore';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { getImageUrl } from '../../../utils/formatters';
import { Product } from '../../../types/models';

export interface CategoryProductSectionProps {
  /** HTML anchor ID for navbar navigation (e.g., 'robes', 'sacs') */
  id: string;
  /** Category slug used to query the API and for the shop filter CTA */
  categorySlug: string;
  /** Display title for the section (e.g., 'Robes', 'Sacs') */
  categoryName: string;
  /** Optional luxury tagline displayed above the title */
  tagline?: string;
  /** Optional editorial subtitle describing the category */
  subtitle?: string;
  /** Custom label for the CTA button */
  ctaText?: string;
  /** Number of products to fetch and display (default: 8) */
  limit?: number;
  /** Background color token to support alternating rhythms */
  bg?: 'white' | 'cream' | 'cream-dark';
}

export const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({
  id,
  categorySlug,
  categoryName,
  tagline,
  subtitle,
  ctaText,
  limit = 4,
  bg = 'cream',
}) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useProducts({
    category: categorySlug,
    per_page: limit,
  });

  const { addItem: addToCart } = useCartStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const products: Product[] = Array.isArray(data?.data)
    ? data.data
    : (data?.data as any)?.data ?? [];

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

  const defaultTagline = `Univers ${categoryName}`;
  const defaultSubtitle = `Explorez notre sélection exclusive de ${categoryName.toLowerCase()} façonnées avec passion et matières nobles.`;
  const defaultCta = `Voir toutes les ${categoryName.toLowerCase()}`;

  return (
    <Section
      id={id}
      spacing="lg"
      bg={bg}
      className="scroll-mt-20 md:scroll-mt-24 border-t border-neutral-150"
    >
      <Container>
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14 space-y-3">
          <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
            {tagline ?? defaultTagline}
          </p>
          <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950">
            {categoryName}
          </h2>
          <p className="text-body-base text-neutral-500 max-w-lg mx-auto leading-relaxed">
            {subtitle ?? defaultSubtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: limit }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorState
            title={`Impossible de charger la collection ${categoryName}`}
            message="Une erreur est survenue lors de la récupération des pièces de cette catégorie."
            onRetry={() => refetch()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-12 px-4 bg-white/80 rounded-md border border-neutral-200/60 max-w-md mx-auto space-y-4">
            <p className="font-serif text-h4 text-neutral-900">
              Collection en cours de réassort
            </p>
            <p className="text-body-sm text-neutral-500">
              Nos nouvelles créations pour la catégorie {categoryName} arrivent très prochainement dans nos ateliers.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/shop?category=${categorySlug}`)}
            >
              Explorer le Catalogue
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
                  categoryName={product.category?.name ?? categoryName}
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
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/shop?category=${categorySlug}`)}
              >
                {ctaText ?? defaultCta}
              </Button>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
};
