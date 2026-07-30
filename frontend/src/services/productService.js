import api from './api';

/**
 * HAFROSE — Standardized Product Service (Phase 14)
 */
const productService = {
  /**
   * Récupère la liste des produits avec filtres, tri et pagination
   */
  getAll: (params = {}, options = {}) => {
    return api.get('/products', { params, ...options });
  },

  /**
   * Récupère un produit par son slug
   */
  getBySlug: (slug, options = {}) => {
    return api.get(`/products/${slug}`, options);
  },

  /**
   * Récupère les produits similaires à un produit
   */
  getRelated: (id, options = {}) => {
    return api.get(`/products/${id}/related`, options);
  },

  /**
   * Récupère les produits les plus populaires
   */
  getPopular: (limit, options = {}) => {
    return api.get('/products/popular', { params: limit ? { limit } : {}, ...options });
  }
};

export default productService;
