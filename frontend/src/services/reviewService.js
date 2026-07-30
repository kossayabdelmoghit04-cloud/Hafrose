import api from './api';

/**
 * HAFROSE — Standardized Review Service (Phase 14)
 */
const reviewService = {
  getAll: (params = {}, options = {}) => {
    return api.get('/reviews', { params, ...options });
  },

  create: (reviewData, options = {}) => {
    return api.post('/reviews', reviewData, options);
  }
};

export default reviewService;
