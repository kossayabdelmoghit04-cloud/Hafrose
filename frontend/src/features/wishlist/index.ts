/**
 * WISHLIST FEATURE — Barrel Export
 *
 * Responsibility: Customer wishlist management.
 * Sync between local Zustand store and Laravel wishlist API.
 * Consumes: wishlistService, useWishlistStore, TanStack Query
 *
 * Internal structure:
 *   components/  — WishlistButton, WishlistDrawer, WishlistItem
 *   hooks/       — useWishlist, useToggleWishlist
 *   pages/       — WishlistPage (lives under account pages)
 */
export * from './hooks/useWishlist';
export * from './hooks/useToggleWishlist';
