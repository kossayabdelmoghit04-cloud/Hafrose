import api from './api';

const productService = {
  /**
   * Récupère la liste des produits avec filtres, tri et pagination
   * @param {Object} params - Les paramètres de requête (category, price_min, price_max, color, material, is_featured, search, sort, page)
   */
  getAll: (params = {}) => {
    return api.get('/products', { params });
  },

  /**
   * Récupère un produit par son slug
   * @param {string} slug - Le slug unique du produit
   */
  getBySlug: (slug) => {
    return api.get(`/products/${slug}`);
  },

  /**
   * Récupère les produits similaires à un produit
   * @param {number|string} id - L'ID du produit
   */
  getRelated: (id) => {
    return api.get(`/products/${id}/related`);
  },

  /**
   * Récupère les produits les plus populaires
   * @param {number} [limit] - Nombre maximum de produits à retourner
   */
  getPopular: (limit) => {
    return api.get('/products/popular', { params: limit ? { limit } : {} });
  }
};

export default productService;
