import api from './api';

const reviewService = {
  /**
   * Récupère la liste de tous les avis approuvés
   * @param {Object} params - Les filtres de requête facultatifs (product_id, rating, limit)
   */
  getAll: (params = {}) => {
    return api.get('/reviews', { params });
  },

  /**
   * Crée un nouvel avis pour un produit
   * @param {Object} reviewData - { product_id, customer_name, customer_email, rating, comment }
   */
  create: (reviewData) => {
    return api.post('/reviews', reviewData);
  }
};

export default reviewService;
