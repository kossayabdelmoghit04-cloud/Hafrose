import { QueryClient } from '@tanstack/react-query';

/**
 * HAFROSE — Centralized TanStack React Query Client (Phase 8 Enterprise Configuration)
 * 
 * Strategy:
 * - staleTime: 5 min  — Data considered fresh; avoids aggressive background refetching
 * - gcTime:   15 min  — Inactive query memory garbage collection threshold
 * - retry: 2          — Exponential retry on 5xx server errors / network dropouts; zero retries on 4xx
 * - networkMode: 'offlineFirst' — Serves cached data seamlessly when offline
 * - refetchOnReconnect: 'always' — Automatically syncs stale data when network reconnects
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 15,         // 15 minutes
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,    // Prevents sudden re-fetches when switching browser tabs
      refetchOnReconnect: 'always',
      refetchOnMount: true,
      retry: (failureCount, error) => {
        // Never retry client errors (400, 401, 403, 404, 422)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0,
    },
  },
});

/**
 * Query key factory — Ensures strongly typed, structured, deduplicated cache keys across the entire app
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
    detail: (slug) => ['categories', 'detail', slug],
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
  reviews: {
    all: ['reviews'],
    byProduct: (productId) => ['reviews', 'product', productId],
  },
  addresses: {
    all: ['addresses'],
    list: () => ['addresses', 'list'],
  },
  notifications: {
    all: ['notifications'],
    unread: () => ['notifications', 'unread'],
  },
  auth: {
    user: () => ['auth', 'user'],
  },
};
