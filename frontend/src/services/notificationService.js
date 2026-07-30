import api from './api';

/**
 * notificationService — Service de gestion des notifications client HAFROSE.
 * Connecté à l'API Laravel /api/auth/notifications.
 * Aucune donnée mockée pré-remplie.
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
  /**
   * Récupérer toutes les notifications du client connecté
   * GET /api/auth/notifications
   */
  async getAll() {
    try {
      const res = await api.get('/auth/notifications');
      const list = res?.data ?? res ?? [];
      cacheSet(list);
      return list;
    } catch {
      return cacheGet() ?? [];
    }
  },

  /**
   * Marquer une notification comme lue
   * PATCH /api/auth/notifications/{id}/read
   */
  async markAsRead(id) {
    try {
      await api.patch(`/auth/notifications/${id}/read`);
    } catch {
      // ignore
    }
    cacheClear();
  },

  /**
   * Marquer toutes les notifications comme lues
   * PATCH /api/auth/notifications/read-all
   */
  async markAllAsRead() {
    try {
      await api.patch('/auth/notifications/read-all');
    } catch {
      // ignore
    }
    cacheClear();
  },

  /**
   * Compter les notifications non lues
   * GET /api/auth/notifications/unread-count
   */
  async getUnreadCount() {
    try {
      const res = await api.get('/auth/notifications/unread-count');
      return res?.data?.count ?? res?.count ?? 0;
    } catch {
      const cached = cacheGet();
      return cached ? cached.filter((n) => !n.read).length : 0;
    }
  },
};

export default notificationService;
