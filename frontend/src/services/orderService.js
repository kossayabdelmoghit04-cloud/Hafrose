import api from './api';

/**
 * orderService — Service de gestion des commandes HAFROSE.
 * Connecté aux endpoints Laravel :
 * - POST /api/orders (Passer une commande)
 * - GET /api/auth/orders (Historique du client connecté)
 * - GET /api/auth/orders/{id} (Détails d'une commande du client)
 */
const orderService = {
  /**
   * Passer une nouvelle commande
   * @param {Object} orderData - Informations de livraison et articles
   */
  create: (orderData) => {
    return api.post('/orders', orderData);
  },

  /**
   * Récupérer l'historique des commandes du client connecté
   * GET /api/auth/orders
   */
  getAll: async () => {
    return api.get('/auth/orders');
  },

  /**
   * Récupérer les détails d'une commande spécifique
   * GET /api/auth/orders/{id}
   */
  getById: async (id) => {
    return api.get(`/auth/orders/${id}`);
  },
};

export default orderService;
