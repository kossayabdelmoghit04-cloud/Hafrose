/**
 * CART FEATURE — Barrel Export
 *
 * Responsibility: Shopping cart state management (local-first, no API persistence).
 * Cart is managed in Zustand; persisted to localStorage. Converted to Order on checkout.
 *
 * Internal structure:
 *   components/  — CartDrawer, CartItem, CartSummary, EmptyCart
 *   hooks/       — useCart, useCartSummary
 *   pages/       — CartPage
 */
export * from './hooks/useCart';
