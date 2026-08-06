import { useQuery } from '@tanstack/react-query';
import { productsService, ProductQueryFilters } from '../../../services/products.service';

export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  list: (filters?: ProductQueryFilters) => ['products', 'list', filters] as const,
  detail: (slug: string) => ['products', 'detail', slug] as const,
};

/**
 * useProducts
 * Fetches a paginated, filtered list of products from Laravel catalog API.
 * Caches data with TanStack Query using a parameterized query key.
 */
export function useProducts(filters?: ProductQueryFilters) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(filters),
    queryFn: () => productsService.getProducts(filters),
  });
}
