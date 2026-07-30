import api from './api';

/**
 * HAFROSE — Standardized Loyalty Service (Phase 14)
 */
export const loyaltyService = {
  async getAccount(options = {}) {
    try {
      const res = await api.get('/loyalty/account', options);
      return res?.data ?? res ?? null;
    } catch (err) {
      if (err.isCanceled) throw err;
      return null;
    }
  },

  async getRewards(options = {}) {
    try {
      const res = await api.get('/loyalty/rewards', options);
      return res?.data ?? res ?? [];
    } catch (err) {
      if (err.isCanceled) throw err;
      return [];
    }
  },
};

export default loyaltyService;
