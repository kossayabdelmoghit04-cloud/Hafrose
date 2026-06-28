import api from './api';

const contactService = {
  /**
   * Envoie le formulaire de contact au backend
   * @param {Object} contactData - { name, email, subject, message }
   */
  submit: (contactData) => {
    return api.post('/contact', contactData);
  }
};

export default contactService;
