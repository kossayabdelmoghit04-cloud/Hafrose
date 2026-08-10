export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    CATALOG: '/catalog',
    PRODUCT_DETAILS: '/catalog/:slug',
    CATEGORY: '/category/:slug',
    ABOUT: '/about',
    CONTACT: '/contact',
    LOOKBOOK: '/lookbook',
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  CUSTOMER: {
    ACCOUNT: '/account',
    PROFILE: '/account/profile',
    ORDERS: '/account/orders',
    ORDER_DETAILS: '/account/orders/:id',
    WISHLIST: '/account/wishlist',
    ADDRESSES: '/account/addresses',
  },
  CHECKOUT: {
    CART: '/cart',
    CHECKOUT: '/checkout',
    CONFIRMATION: '/checkout/confirmation/:orderNumber',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    LOGIN: '/admin/login',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    SETTINGS: '/admin/settings',
  },
} as const;
