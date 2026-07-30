import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { useResilientQuery } from './api/useResilientQuery';

/**
 * HAFROSE — Resilient Product & Category Hooks (Phase 8 & 14)
 */

export function useProducts(filters = {}, options = {}) {
  return useResilientQuery(
    queryKeys.products.list(filters),
    ({ signal }) => productService.getAll(filters, { signal }),
    {
      select: (data) => data?.data ?? data ?? [],
      ...options,
    }
  );
}

export function useProduct(slug, options = {}) {
  return useResilientQuery(
    queryKeys.products.detail(slug),
    ({ signal }) => productService.getBySlug(slug, { signal }),
    {
      enabled: !!slug,
      select: (data) => data?.data ?? data ?? null,
      ...options,
    }
  );
}

export function useFeaturedProducts(options = {}) {
  return useResilientQuery(
    queryKeys.products.featured(),
    ({ signal }) => productService.getAll({ featured: 1 }, { signal }),
    {
      staleTime: 1000 * 60 * 10,
      select: (data) => data?.data ?? data ?? [],
      ...options,
    }
  );
}

export function useRelatedProducts(slug, options = {}) {
  return useResilientQuery(
    queryKeys.products.related(slug),
    ({ signal }) => productService.getRelated(slug, { signal }),
    {
      enabled: !!slug,
      select: (data) => data?.data ?? data ?? [],
      ...options,
    }
  );
}

export function useCategories(options = {}) {
  return useResilientQuery(
    queryKeys.categories.list(),
    ({ signal }) => categoryService.getAll({ signal }),
    {
      staleTime: 1000 * 60 * 15,
      select: (data) => data?.data ?? data ?? [],
      ...options,
    }
  );
}

export function usePrefetchProduct() {
  const queryClient = useQueryClient();
  return (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(slug),
      queryFn: ({ signal }) => productService.getBySlug(slug, { signal }),
      staleTime: 1000 * 60 * 2,
    });
  };
}
