import { useQuery } from '@tanstack/react-query';
import { productsService, ProductQueryFilters } from '../services/products.service';

export const PRODUCTS_QUERY_KEY = ['products'];
export const CATEGORIES_QUERY_KEY = ['categories'];

/**
 * useProducts
 * Paginated, filtered product list.
 */
export function useProducts(filters?: ProductQueryFilters) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, filters],
    queryFn: () => productsService.getProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * useProduct
 * Single product detail by slug.
 */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', slug],
    queryFn: () => productsService.getProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * useFeaturedProducts
 * Products marked as featured — used by BestSellersSection.
 */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'featured', limit],
    queryFn: () => productsService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * useNewArrivals
 * Most recent products — used by NewCollectionSection.
 */
export function useNewArrivals(limit = 6) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'new-arrivals', limit],
    queryFn: () => productsService.getNewArrivals(limit),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * useRelatedProducts
 * Products related to a given slug — used by ProductDetailPage.
 */
export function useRelatedProducts(slug: string, limit = 4) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'related', slug],
    queryFn: () => productsService.getRelatedProducts(slug, limit),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * useCategories
 * All active categories — used by CategoriesSection + ShopPage filters.
 */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => productsService.getCategories(),
    staleTime: 1000 * 60 * 30, // Categories change rarely
  });
}
