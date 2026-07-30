import api from './api';

/**
 * HAFROSE — Standardized Customer Auth Service (Phase 14)
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

  async login(credentials, options = {}) {
    const res = await api.post('/auth/login', credentials, options);
    if (res?.success && res.data?.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async register(data, options = {}) {
    const res = await api.post('/auth/register', data, options);
    if (res?.success && res.data?.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async logout(options = {}) {
    try {
      const token = this.getToken();
      if (token) {
        await api.post('/auth/logout', {}, options);
      }
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      this.setToken(null);
      this.setUser(null);
    }
  },

  async fetchMe(options = {}) {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await api.get('/auth/me', options);
      if (res) {
        this.setUser(res.data ?? res);
        return res.data ?? res;
      }
    } catch (err) {
      if (err.isCanceled) throw err;
      return this.getUser();
    }
  },

  async requestPasswordReset(email, options = {}) {
    return api.post('/auth/forgot-password', { email }, options);
  },

  async resetPassword(data, options = {}) {
    return api.post('/auth/reset-password', data, options);
  },

  async updateProfile(data, options = {}) {
    const res = await api.put('/auth/profile', data, options);
    if (res?.data) {
      this.setUser({ ...this.getUser(), ...res.data });
    }
    return res;
  },

  async updatePassword(data, options = {}) {
    return api.put('/auth/password', data, options);
  },
};

export default customerAuthService;
