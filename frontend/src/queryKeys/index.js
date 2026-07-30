/**
 * HAFROSE — Centralized Enterprise Query Keys (Phase 3)
 * 
 * Provides strongly-typed, structured, non-overlapping query key factories
 * for all application domains, guaranteeing zero cache collisions and predictable invalidation.
 */

export const queryKeys = {
  products: {
    all: ['products'],
    lists: () => ['products', 'list'],
    list: (filters = {}) => ['products', 'list', filters],
    details: () => ['products', 'detail'],
    detail: (slug) => ['products', 'detail', slug],
    featured: () => ['products', 'featured'],
    related: (slug) => ['products', 'related', slug],
    popular: (limit) => ['products', 'popular', limit],
  },
  categories: {
    all: ['categories'],
    lists: () => ['categories', 'list'],
    list: (params = {}) => ['categories', 'list', params],
    detail: (slug) => ['categories', 'detail', slug],
  },
  cart: {
    all: ['cart'],
    items: () => ['cart', 'items'],
    summary: () => ['cart', 'summary'],
  },
  wishlist: {
    all: ['wishlist'],
    items: () => ['wishlist', 'items'],
    check: (productId) => ['wishlist', 'check', productId],
  },
  orders: {
    all: ['orders'],
    lists: () => ['orders', 'list'],
    list: (params = {}) => ['orders', 'list', params],
    details: () => ['orders', 'detail'],
    detail: (id) => ['orders', 'detail', id],
  },
  profile: {
    all: ['profile'],
    user: () => ['profile', 'user'],
    me: () => ['profile', 'me'],
  },
  notifications: {
    all: ['notifications'],
    list: () => ['notifications', 'list'],
    unread: () => ['notifications', 'unread'],
  },
  addresses: {
    all: ['addresses'],
    list: () => ['addresses', 'list'],
    default: () => ['addresses', 'default'],
  },
  reviews: {
    all: ['reviews'],
    list: (params = {}) => ['reviews', 'list', params],
    byProduct: (productId) => ['reviews', 'product', productId],
  },
  loyalty: {
    all: ['loyalty'],
    account: () => ['loyalty', 'account'],
    rewards: () => ['loyalty', 'rewards'],
  },
  analytics: {
    all: ['analytics'],
    business: (params = {}) => ['analytics', 'business', params],
    webVitals: () => ['analytics', 'webVitals'],
  },
  dashboard: {
    all: ['dashboard'],
    stats: () => ['dashboard', 'stats'],
    charts: () => ['dashboard', 'charts'],
  },
};
