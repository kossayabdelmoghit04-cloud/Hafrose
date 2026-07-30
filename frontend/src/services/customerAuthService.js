import api from './api';

/**
 * customerAuthService — Service d'authentification client HAFROSE.
 * Connecté à l'API Laravel /api/auth/* via Sanctum.
 * Aucun fallback de données mockées en mode production.
 */

const TOKEN_KEY = 'hafrose_customer_token';
const USER_KEY = 'hafrose_customer_user';

export const customerAuthService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
  },

  getUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Authentifier un client via POST /api/auth/login
   */
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res?.success && res.data?.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  /**
   * Inscrire un client via POST /api/auth/register
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res?.success && res.data?.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  /**
   * Déconnecter le client via POST /api/auth/logout
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors during logout — toujours nettoyer la session locale
    } finally {
      this.setToken(null);
      this.setUser(null);
    }
  },

  /**
   * Récupérer le profil client connecté via GET /api/auth/me (ou /api/user Sanctum)
   */
  async fetchMe() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await api.get('/auth/me');
      if (res) {
        this.setUser(res.data ?? res);
        return res.data ?? res;
      }
    } catch {
      return this.getUser();
    }
  },

  /**
   * Demander un lien de réinitialisation via POST /api/auth/forgot-password
   */
  async requestPasswordReset(email) {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Réinitialiser le mot de passe via POST /api/auth/reset-password
   */
  async resetPassword(data) {
    return api.post('/auth/reset-password', data);
  },

  /**
   * Mettre à jour le profil du client connecté via PUT /api/auth/profile
   */
  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    if (res?.data) {
      this.setUser({ ...this.getUser(), ...res.data });
    }
    return res;
  },

  /**
   * Mettre à jour le mot de passe du client connecté via PUT /api/auth/password
   */
  async updatePassword(data) {
    return api.put('/auth/password', data);
  },
};

export default customerAuthService;
