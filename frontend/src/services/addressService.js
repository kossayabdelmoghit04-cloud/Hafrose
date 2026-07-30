import api from './api';

/**
 * HAFROSE — Standardized Address Service (Phase 14)
 */
const LOCAL_KEY = 'hafrose_user_addresses';

function cacheGet() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function cacheSet(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function cacheClear() {
  localStorage.removeItem(LOCAL_KEY);
}

export const addressService = {
  async getAll(options = {}) {
    try {
      const res = await api.get('/auth/addresses', options);
      const list = res?.data ?? res ?? [];
      cacheSet(list);
      return list;
    } catch (err) {
      if (err.isCanceled) throw err;
      return cacheGet() ?? [];
    }
  },

  async add(newAddr, options = {}) {
    const res = await api.post('/auth/addresses', newAddr, options);
    cacheClear();
    return res?.data ?? res;
  },

  async update(id, addrData, options = {}) {
    const res = await api.put(`/auth/addresses/${id}`, addrData, options);
    cacheClear();
    return res?.data ?? res;
  },

  async delete(id, options = {}) {
    await api.delete(`/auth/addresses/${id}`, options);
    cacheClear();
    return true;
  },

  async setDefault(id, options = {}) {
    const res = await api.patch(`/auth/addresses/${id}/default`, {}, options);
    cacheClear();
    return res?.data ?? res;
  },
};

export default addressService;
