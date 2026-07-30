import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

/**
 * HAFROSE — Predictive & Intelligent Prefetch Strategy Hook (Phase 11)
 * 
 * Enables prefetching data on link hover, focus, or predictive intent:
 * - Product detail preloading
 * - Category list & details preloading
 * - Reduces page transition latency to zero
 */
export function usePrefetchStrategy() {
  const queryClient = useQueryClient();

  const prefetchProduct = (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(slug),
      queryFn: ({ signal }) => productService.getBySlug(slug, { signal }),
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: ({ signal }) => categoryService.getAll({ signal }),
      staleTime: 1000 * 60 * 15,
    });
  };

  const prefetchCategoryProducts = (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list({ category: slug }),
      queryFn: ({ signal }) => productService.getAll({ category: slug }, { signal }),
      staleTime: 1000 * 60 * 5,
    });
  };

  return {
    prefetchProduct,
    prefetchCategories,
    prefetchCategoryProducts,
  };
}
