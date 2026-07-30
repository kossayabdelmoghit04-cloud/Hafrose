import api from './api';

/**
 * HAFROSE — Standardized Order Service (Phase 14)
 */
const orderService = {
  create: (orderData, options = {}) => {
    return api.post('/orders', orderData, options);
  },

  getAll: (options = {}) => {
    return api.get('/auth/orders', options);
  },

  getById: (id, options = {}) => {
    return api.get(`/auth/orders/${id}`, options);
  },
};

export default orderService;
