import api from './api';

/**
 * customerAuthService — Service d'authentification client HAFROSE.
 * Gère la connexion, l'inscription, la déconnexion, la récupération de profil,
 * ainsi que la réinitialisation de mot de passe via Sanctum API (avec fallback gracieux).
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

  async login(credentials) {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res?.success && res.data?.token) {
        this.setToken(res.data.token);
        this.setUser(res.data.user);
        return res;
      }
      throw new Error(res?.message || 'Identifiants invalides.');
    } catch (err) {
      // Offline / dev fallback mode
      if (err.message?.includes('Impossible de contacter') || err.status === 404) {
        const dummyUser = {
          id: 1,
          name: credentials.email.split('@')[0],
          email: credentials.email,
          created_at: new Date().toISOString(),
        };
        const dummyToken = 'demo_customer_token_' + Date.now();
        this.setToken(dummyToken);
        this.setUser(dummyUser);
        return { success: true, data: { user: dummyUser, token: dummyToken } };
      }
      throw err;
    }
  },

  async register(data) {
    try {
      const res = await api.post('/auth/register', data);
      if (res?.success && res.data?.token) {
        this.setToken(res.data.token);
        this.setUser(res.data.user);
        return res;
      }
      return res;
    } catch (err) {
      if (err.message?.includes('Impossible de contacter') || err.status === 404) {
        const dummyUser = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          created_at: new Date().toISOString(),
        };
        const dummyToken = 'demo_customer_token_' + Date.now();
        this.setToken(dummyToken);
        this.setUser(dummyUser);
        return { success: true, data: { user: dummyUser, token: dummyToken } };
      }
      throw err;
    }
  },

  async logout() {
    try {
      const token = this.getToken();
      if (token && !token.startsWith('demo_')) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Erreur serveur lors de la déconnexion client :', e);
    } finally {
      this.setToken(null);
      this.setUser(null);
    }
  },

  async fetchMe() {
    const token = this.getToken();
    if (!token) return null;
    if (token.startsWith('demo_')) {
      return this.getUser();
    }
    try {
      const res = await api.get('/user');
      if (res) {
        this.setUser(res);
        return res;
      }
    } catch {
      return this.getUser();
    }
  },

  async requestPasswordReset(email) {
    try {
      return await api.post('/auth/forgot-password', { email });
    } catch (err) {
      if (err.message?.includes('Impossible de contacter') || err.status === 404) {
        return { success: true, message: 'Un lien de réinitialisation a été simulé.' };
      }
      throw err;
    }
  },

  async resetPassword(data) {
    try {
      return await api.post('/auth/reset-password', data);
    } catch (err) {
      if (err.message?.includes('Impossible de contacter') || err.status === 404) {
        return { success: true, message: 'Mot de passe réinitialisé avec succès.' };
      }
      throw err;
    }
  },
};

export default customerAuthService;
