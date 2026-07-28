const LOCAL_KEY = 'hafrose_user_notifications';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Bienvenue dans la Maison Hafrose',
    message: 'Votre compte privilège a été activé. Profitez de la livraison offerte sur votre première création.',
    date: new Date().toISOString(),
    read: false,
    type: 'promo',
  },
  {
    id: 2,
    title: 'Nouvelle Collection Automne-Hiver',
    message: 'Découvrez en avant-première nos nouvelles pièces de Haute Maroquinerie.',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    type: 'announcement',
  },
];

export const notificationService = {
  getAll() {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveAll(list) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erreur sauvegarde notifications :', e);
    }
  },

  markAsRead(id) {
    const list = this.getAll();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveAll(updated);
    return updated;
  },

  markAllAsRead() {
    const list = this.getAll();
    const updated = list.map((n) => ({ ...n, read: true }));
    this.saveAll(updated);
    return updated;
  },

  getUnreadCount() {
    return this.getAll().filter((n) => !n.read).length;
  },
};

export default notificationService;
