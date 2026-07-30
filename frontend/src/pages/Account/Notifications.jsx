import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import notificationService from '../../services/notificationService';
import useSEO from '../../hooks/useSEO';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Notifications — Espace Client',
    description: 'Consultez vos messages et notifications privées Maison Hafrose.',
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-beige pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
            Centre de Notifications
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light mt-1">
            Vos invitations privées, alertes de commande et actualités de la Maison.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal transition-colors flex items-center gap-1.5"
          >
            <FiCheckCircle size={13} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-beige p-12 text-center space-y-3">
          <FiBell size={36} className="mx-auto text-warm-gray/40" />
          <p className="font-sans text-xs text-warm-gray">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border p-6 space-y-2 transition-colors ${
                notif.read ? 'border-beige opacity-70' : 'border-rose-gold/60 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-gold animate-pulse" />
                  )}
                  <h3 className="font-sans text-xs font-semibold text-luxury-charcoal uppercase tracking-wider">
                    {notif.title}
                  </h3>
                </div>

                <span className="font-sans text-[10px] text-warm-gray">
                  {new Date(notif.date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <p className="font-sans text-xs text-luxury-gray font-light leading-relaxed">
                {notif.message}
              </p>

              {!notif.read && (
                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notif.id)}
                    className="font-sans text-[9px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal flex items-center gap-1 ml-auto"
                  >
                    <FiCheck size={11} /> Marquer comme lu
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
