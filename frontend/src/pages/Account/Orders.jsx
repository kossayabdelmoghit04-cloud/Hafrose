import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiArrowRight, FiTruck } from 'react-icons/fi';
import orderService from '../../services/orderService';
import useSEO from '../../hooks/useSEO';
import { formatPrice } from '../../utils/format';

const STATUS_MAP = {
  pending: { label: 'En attente', class: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmée', class: 'bg-blue-50 text-blue-800 border-blue-200' },
  processing: { label: 'Préparation', class: 'bg-purple-50 text-purple-800 border-purple-200' },
  shipped: { label: 'Expédiée', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  delivered: { label: 'Livrée', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Annulée', class: 'bg-red-50 text-red-800 border-red-200' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useSEO({
    title: 'Mes Commandes — Espace Client',
    description: 'Historique et suivi de vos commandes Maison Hafrose.',
  });

  useEffect(() => {
    orderService.getAll()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setOrders(res.data);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-beige pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
            Mes Commandes
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light mt-1">
            Consultez l'historique et suivez l'avancement de vos pièces d'exception.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`font-sans text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                filter === f
                  ? 'border-luxury-charcoal bg-luxury-charcoal text-off-white font-medium'
                  : 'border-beige bg-white text-warm-gray hover:text-luxury-charcoal'
              }`}
            >
              {f === 'all' ? 'Toutes' : STATUS_MAP[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center font-sans text-xs text-warm-gray">
          Chargement de vos commandes…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-beige p-12 text-center space-y-4">
          <FiShoppingBag size={40} className="mx-auto text-warm-gray/40" />
          <h3 className="font-serif text-lg text-luxury-charcoal font-light">
            Aucune commande trouvée
          </h3>
          <p className="font-sans text-xs text-warm-gray font-light max-w-sm mx-auto">
            {filter === 'all'
              ? 'Vous n\'avez pas encore effectué de commande avec ce compte.'
              : `Aucune commande avec le statut "${STATUS_MAP[filter]?.label}".`}
          </p>
          <Link
            to="/shop"
            className="inline-block bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-6 py-3.5 hover:bg-rose-gold transition-colors"
          >
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.confirmed;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-beige p-6 space-y-4 shadow-sm hover:border-rose-gold/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-beige pb-4 gap-2">
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray block">
                      Commande #{order.order_number || order.id}
                    </span>
                    <span className="font-sans text-xs text-luxury-charcoal font-light">
                      Passée le {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-sans text-[10px] uppercase tracking-wider px-2.5 py-1 border font-medium ${statusConfig.class}`}>
                      {statusConfig.label}
                    </span>
                    <span className="font-sans text-base font-semibold text-rose-gold">
                      {formatPrice(order.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2">
                  {(order.items || []).slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between font-sans text-xs text-luxury-charcoal font-light">
                      <span>{item.name || item.product?.name || 'Création Maison Hafrose'} × {item.quantity || 1}</span>
                      <span className="text-warm-gray">{formatPrice(item.price || 0)}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 2 && (
                    <p className="font-sans text-[10px] text-warm-gray italic">
                      + {(order.items || []).length - 2} autre(s) article(s)
                    </p>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between border-t border-beige pt-4">
                  <Link
                    to={`/account/orders/tracking/${order.id}`}
                    className="font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal transition-colors flex items-center gap-1.5"
                  >
                    <FiTruck size={12} />
                    Suivre le colis
                  </Link>

                  <Link
                    to={`/account/orders/${order.id}`}
                    className="font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal hover:text-rose-gold font-medium flex items-center gap-1"
                  >
                    Détails complets <FiArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
