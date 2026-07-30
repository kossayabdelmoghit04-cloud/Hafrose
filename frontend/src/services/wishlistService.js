import api from './api';

/**
 * wishlistService — Service favoris connecté à Laravel API /api/wishlist
 */
export const wishlistService = {
  /**
   * Récupérer tous les favoris de l'utilisateur connecté
   */
  async getAll() {
    return api.get('/wishlist');
  },

  /**
   * Ajouter un produit aux favoris
   * @param {number|string} productId 
   */
  async add(productId) {
    return api.post('/wishlist', { product_id: productId });
  },

  /**
   * Retirer un produit des favoris
   * @param {number|string} productId 
   */
  async remove(productId) {
    return api.delete(`/wishlist/${productId}`);
  },

  /**
   * Vérifier si un produit est en favori
   * @param {number|string} productId 
   */
  async check(productId) {
    return api.get(`/wishlist/check/${productId}`);
  },
};

export default wishlistService;
