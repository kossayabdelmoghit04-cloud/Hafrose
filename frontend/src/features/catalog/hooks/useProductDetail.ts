import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../../services/products.service';
import { PRODUCTS_QUERY_KEYS } from './useProducts';

/**
 * useProductDetail
 * Fetches a single product with gallery, related items, and category.
 * Uses the product slug as the cache key.
 */
export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.detail(slug),
    queryFn: () => productsService.getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}
