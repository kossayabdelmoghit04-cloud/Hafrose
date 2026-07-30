import api from './api';

/**
 * HAFROSE — Standardized Category Service (Phase 14)
 */
const categoryService = {
  /**
   * Récupère la liste de toutes les catégories
   */
  getAll: (options = {}) => {
    return api.get('/categories', options);
  },

  /**
   * Récupère une catégorie par son slug
   */
  getBySlug: (slug, options = {}) => {
    return api.get(`/categories/${slug}`, options);
  }
};

export default categoryService;
