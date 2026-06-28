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
  }
};

export default productService;
