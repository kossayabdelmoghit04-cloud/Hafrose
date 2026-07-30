import api from './api';

/**
 * HAFROSE — Standardized Notification Service (Phase 14)
 */
const LOCAL_KEY = 'hafrose_user_notifications';

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
    // ignore
  }
}

function cacheClear() {
  localStorage.removeItem(LOCAL_KEY);
}

export const notificationService = {
  async getAll(options = {}) {
    try {
      const res = await api.get('/auth/notifications', options);
      const list = res?.data ?? res ?? [];
      cacheSet(list);
      return list;
    } catch (err) {
      if (err.isCanceled) throw err;
      return cacheGet() ?? [];
    }
  },

  async markAsRead(id, options = {}) {
    try {
      await api.patch(`/auth/notifications/${id}/read`, {}, options);
    } catch {
      // ignore
    }
    cacheClear();
  },

  async markAllAsRead(options = {}) {
    try {
      await api.patch('/auth/notifications/read-all', {}, options);
    } catch {
      // ignore
    }
    cacheClear();
  },

  async getUnreadCount(options = {}) {
    try {
      const res = await api.get('/auth/notifications/unread-count', options);
      return res?.data?.count ?? res?.count ?? 0;
    } catch (err) {
      if (err.isCanceled) throw err;
      const cached = cacheGet();
      return cached ? cached.filter((n) => !n.read).length : 0;
    }
  },
};

export default notificationService;
