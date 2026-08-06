export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/customer/login',
    REGISTER: '/customer/register',
    LOGOUT: '/customer/logout',
    PROFILE: '/customer/profile',
    SANCTUM_CSRF: '/sanctum/csrf-cookie',
  },
  // Catalog
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (slug: string) => `/products/${slug}`,
    FEATURED: '/products/featured',
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (slug: string) => `/categories/${slug}`,
  },
  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (id: number) => `/orders/${id}`,
  },
  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId: number) => `/wishlist/${productId}`,
  },
  // Admin
  ADMIN: {
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
} as const;
