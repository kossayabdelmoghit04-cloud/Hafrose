import api from './api';

/**
 * loyaltyService — Service du programme de fidélité HAFROSE.
 * Connecté aux endpoints Laravel /api/loyalty/account et /api/loyalty/rewards.
 */
export const loyaltyService = {
  /**
   * Obtenir le compte fidélité du client
   * GET /api/loyalty/account
   */
  async getAccount() {
    try {
      const res = await api.get('/loyalty/account');
      return res?.data ?? res ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Obtenir la liste des récompenses disponibles
   * GET /api/loyalty/rewards
   */
  async getRewards() {
    try {
      const res = await api.get('/loyalty/rewards');
      return res?.data ?? res ?? [];
    } catch {
      return [];
    }
  },
};

export default loyaltyService;
