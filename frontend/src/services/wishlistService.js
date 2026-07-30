import api from './api';

/**
 * HAFROSE — Standardized Wishlist Service (Phase 14)
 */
export const wishlistService = {
  getAll(options = {}) {
    return api.get('/wishlist', options);
  },

  add(productId, options = {}) {
    return api.post('/wishlist', { product_id: productId }, options);
  },

  remove(productId, options = {}) {
    return api.delete(`/wishlist/${productId}`, options);
  },

  check(productId, options = {}) {
    return api.get(`/wishlist/check/${productId}`, options);
  },
};

export default wishlistService;
