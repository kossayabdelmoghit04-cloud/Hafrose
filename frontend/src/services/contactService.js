import api from './api';

/**
 * HAFROSE — Standardized Contact Service (Phase 14)
 */
const contactService = {
  submit: (contactData, options = {}) => {
    return api.post('/contact', contactData, options);
  }
};

export default contactService;
