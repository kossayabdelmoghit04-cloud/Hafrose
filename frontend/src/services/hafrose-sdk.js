/**
 * HAFROSE Enterprise SDK v2.0 — JavaScript
 * Client léger pour intégrations frontend, mobile et tierces.
 */

const HAFROSE_API_BASE = typeof window !== 'undefined'
  ? (window.HAFROSE_API_BASE || '/api')
  : '/api';

const hafroseRequest = async (method, path, data = null, headers = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${HAFROSE_API_BASE}${path}`, options);
  return res.json();
};

export const HafroseSDK = {
  /** Products & Catalogue */
  products: {
    list: (params = {}) => hafroseRequest('GET', `/products?${new URLSearchParams(params)}`),
    get: (slug) => hafroseRequest('GET', `/products/${slug}`),
    popular: (limit = 8) => hafroseRequest('GET', `/products/popular?limit=${limit}`),
    autocomplete: (q) => hafroseRequest('GET', `/products/autocomplete?q=${encodeURIComponent(q)}`),
    semanticSearch: (q) => hafroseRequest('GET', `/products/search/semantic?q=${encodeURIComponent(q)}`),
  },

  /** AI Recommendations */
  recommendations: {
    forYou: () => hafroseRequest('GET', '/recommendations/for-you'),
    favorites: () => hafroseRequest('GET', '/recommendations/favorites'),
    complementary: (productId) => hafroseRequest('GET', `/products/${productId}/complementary`),
  },

  /** AI Concierge Shopping Assistant */
  ai: {
    chat: (message) => hafroseRequest('POST', '/ai/chat', { message }),
  },

  /** Loyalty Program */
  loyalty: {
    getAccount: (authToken) => hafroseRequest('GET', '/loyalty/account', null, { Authorization: `Bearer ${authToken}` }),
    getRewards: (authToken) => hafroseRequest('GET', '/loyalty/rewards', null, { Authorization: `Bearer ${authToken}` }),
  },

  /** Gift Cards */
  giftCards: {
    check: (code) => hafroseRequest('GET', `/gift-cards/check?code=${encodeURIComponent(code)}`),
  },

  /** Multi-Currency */
  currencies: {
    getRates: () => hafroseRequest('GET', '/currencies'),
  },

  /** Webhooks */
  webhooks: {
    register: (name, url, events, authToken) =>
      hafroseRequest('POST', '/admin/webhooks', { name, url, events }, { Authorization: `Bearer ${authToken}` }),
  },

  /** Mobile App Integration */
  mobile: {
    getConfig: () => hafroseRequest('GET', '/mobile/config'),
    registerDeviceToken: (token, platform, authToken) =>
      hafroseRequest('POST', '/mobile/register-token', { token, platform }, { Authorization: `Bearer ${authToken}` }),
  },

  /** Personalization */
  personalization: {
    getHomepage: () => hafroseRequest('GET', '/personalization/homepage'),
  },
};

export default HafroseSDK;
