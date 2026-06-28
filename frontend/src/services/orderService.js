import api from './api';

const orderService = {
  /**
   * Envoie une commande vers le serveur
   * @param {Object} orderData - Les informations de la commande (customer_name, customer_email, customer_phone, customer_address, customer_city, items: [{product_id, quantity}])
   */
  create: (orderData) => {
    return api.post('/orders', orderData);
  }
};

export default orderService;
