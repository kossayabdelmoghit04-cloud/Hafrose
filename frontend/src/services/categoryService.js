import api from './api';

const categoryService = {
  /**
   * Récupère la liste de toutes les catégories
   */
  getAll: () => {
    return api.get('/categories');
  },

  /**
   * Récupère une catégorie par son slug (avec ses produits associés)
   * @param {string} slug 
   */
  getBySlug: (slug) => {
    return api.get(`/categories/${slug}`);
  }
};

export default categoryService;
