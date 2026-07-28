import { useQuery, usePrefetchQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

/**
 * Hook — Products list with optional filtering
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
    select: (data) => data?.data ?? [],
  });
}

/**
 * Hook — Single product by slug
 */
export function useProduct(slug) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => productService.getProduct(slug),
    enabled: !!slug,
    select: (data) => data?.data ?? null,
  });
}

/**
 * Hook — Featured products for homepage
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: () => productService.getProducts({ featured: 1 }),
    staleTime: 1000 * 60 * 10, // Featured products stale after 10 min
    select: (data) => data?.data ?? [],
  });
}

/**
 * Hook — Related products (used in product detail)
 */
export function useRelatedProducts(slug) {
  return useQuery({
    queryKey: queryKeys.products.related(slug),
    queryFn: () => productService.getRelatedProducts(slug),
    enabled: !!slug,
    select: (data) => data?.data ?? [],
  });
}

/**
 * Hook — Categories list
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 15, // Categories rarely change — 15 min
    select: (data) => data?.data ?? [],
  });
}

/**
 * Prefetch product detail on hover — improves navigation UX
 * Call this from product card mouse-enter event
 */
export function usePrefetchProduct() {
  const prefetch = usePrefetchQuery();
  return (slug) => {
    if (!slug) return;
    prefetch({
      queryKey: queryKeys.products.detail(slug),
      queryFn: () => productService.getProduct(slug),
      staleTime: 1000 * 60 * 2,
    });
  };
}
