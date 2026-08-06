import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../../services/products.service';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

/**
 * useCategories
 * Fetches all active product categories.
 * Long cache time (15min stale) — category data changes rarely.
 */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => productsService.getCategories(),
    staleTime: 1000 * 60 * 15,
  });
}
