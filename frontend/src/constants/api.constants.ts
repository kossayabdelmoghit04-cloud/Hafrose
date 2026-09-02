export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    UPDATE_PASSWORD: '/auth/password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SANCTUM_CSRF: '/sanctum/csrf-cookie',
  },
  // Customer Addresses
  ADDRESSES: {
    LIST: '/auth/addresses',
    CREATE: '/auth/addresses',
    UPDATE: (id: number) => `/auth/addresses/${id}`,
    DELETE: (id: number) => `/auth/addresses/${id}`,
    SET_DEFAULT: (id: number) => `/auth/addresses/${id}/default`,
  },
  // Catalog
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (slug: string) => `/products/${slug}`,
    POPULAR: '/products/popular',
    SEARCH: '/products/search',
    AUTOCOMPLETE: '/products/autocomplete',
    FILTERS: '/products/filters',
    RELATED: (id: number | string) => `/products/${id}/related`,
    SIMILAR: (id: number | string) => `/products/${id}/similar`,
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (slug: string) => `/categories/${slug}`,
  },
  // Orders
  ORDERS: {
    CREATE: '/orders',
    MY_ORDERS: '/auth/orders',
    MY_ORDER_DETAILS: (id: number) => `/auth/orders/${id}`,
  },
  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId: number) => `/wishlist/${productId}`,
    CHECK: (productId: number) => `/wishlist/check/${productId}`,
  },
  // Reviews & Contact
  REVIEWS: {
    LIST: '/reviews',
    SUBMIT: '/reviews',
  },
  CONTACT: {
    SUBMIT: '/contact',
  },
  // Admin
  ADMIN: {
    LOGIN: '/admin/login',
    LOGOUT: '/admin/logout',
    ME: '/admin/me',
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    REVIEWS: '/admin/reviews',
    SETTINGS: '/admin/settings',
    MEDIA: '/admin/media',
  },
} as const;

