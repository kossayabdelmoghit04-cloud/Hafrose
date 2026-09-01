import React from 'react';
import { Filter } from 'lucide-react';
import { Container } from '../ui/Container';
import { ProductCard } from '../ui/ProductCard';
import { ProductCardSkeleton } from '../ui/ProductCard/ProductCardSkeleton';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { ErrorState } from '../ui/ErrorState';
import { Product } from '../../types/models';
import { ApiPaginationMeta } from '../../types/api';
import { getImageUrl } from '../../utils/formatters';

interface ShopProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  isWishlisted: (id: number) => boolean;
  onWishlistToggle: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onProductClick: (slug: string) => void;
  meta?: ApiPaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  products,
  isLoading,
  isError,
  onRetry,
  onResetFilters,
  isWishlisted,
  onWishlistToggle,
  onQuickAdd,
  onProductClick,
  meta,
  currentPage,
  onPageChange,
}) => {
  return (
    <main className="py-6 md:py-8">
      <Container>
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="py-12">
            <ErrorState
              title="Impossible de charger le catalogue"
              message="Une erreur est survenue lors de la connexion au serveur HAFROSE."
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-16 px-6 max-w-lg mx-auto bg-white rounded-md border border-neutral-200/80 shadow-hafrose-xs space-y-4 my-8">
            <div className="w-14 h-14 rounded-full bg-cream-200 text-neutral-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-h3 text-neutral-900">Aucun produit trouvé</h3>
            <p className="text-body-sm text-neutral-500 leading-relaxed">
              Aucune création ne correspond à vos critères de sélection actuels. Essayez de modifier vos filtres ou de réinitialiser votre recherche.
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={onResetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                  badgeText={
                    product.is_featured
                      ? 'Best-seller'
                      : product.sale_price && Number(product.sale_price) < Number(product.price)
                        ? product.discount_percentage
                          ? `-${product.discount_percentage}%`
                          : 'Soldes'
                        : undefined
                  }
                  isWishlisted={isWishlisted(product.id)}
                  onWishlistToggle={() => onWishlistToggle(product)}
                  onQuickAdd={() => onQuickAdd(product)}
                  onClick={(slug) => onProductClick(slug)}
                />
              ))}
            </div>

            {/* Pagination */}
            {(meta?.last_page ?? 1) > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={meta?.last_page ?? 1}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        )}
      </Container>
    </main>
  );
};
