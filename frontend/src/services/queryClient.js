import { QueryClient } from '@tanstack/react-query';

/**
 * HAFROSE — Centralized TanStack React Query Client (Phase 5.4)
 * 
 * Cache strategy:
 * - staleTime: 5 min  — data considered fresh, no background refetch
 * - gcTime:   15 min  — inactive queries kept in memory before GC
 * - retry: 1          — one automatic retry on failure (avoids flooding on 4xx)
 * - refetchOnWindowFocus: false — prevents jarring re-fetches on tab switch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 15,         // 15 minutes
      retry: (failureCount, error) => {
        // Do not retry on client errors (4xx) — only server errors (5xx)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Mutations retry once on network failure
      retry: 0,
    },
  },
});

/**
 * Query key factory — ensures consistent, structured cache keys
 * Usage: queryKeys.products.list({ category: 'sacs' })
 */
export const queryKeys = {
  products: {
    all: ['products'],
    list: (filters = {}) => ['products', 'list', filters],
    detail: (slug) => ['products', 'detail', slug],
    featured: () => ['products', 'featured'],
    related: (slug) => ['products', 'related', slug],
  },
  categories: {
    all: ['categories'],
    list: () => ['categories', 'list'],
  },
  cart: {
    all: ['cart'],
    items: () => ['cart', 'items'],
  },
  orders: {
    all: ['orders'],
    list: () => ['orders', 'list'],
    detail: (id) => ['orders', 'detail', id],
  },
  wishlist: {
    all: ['wishlist'],
    items: () => ['wishlist', 'items'],
  },
};
