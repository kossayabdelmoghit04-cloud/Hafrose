import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiHeart, FiArrowRight, FiShield, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import orderService from '../../services/orderService';
import notificationService from '../../services/notificationService';
import useSEO from '../../hooks/useSEO';
import { formatPrice } from '../../utils/format';

export default function Dashboard() {
  const { customerUser } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Tableau de bord — Espace Client',
    description: 'Aperçu général de votre compte Maison Hafrose.',
  });

  useEffect(() => {
    setUnreadNotifications(notificationService.getUnreadCount());
    orderService.getAll()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status)).length;
  const latestOrders = orders.slice(0, 3);

  return (
    <div className="space-y-10 text-left">
      {/* ── Welcome Banner ── */}
      <div className="border-b border-beige pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-rose-gold font-semibold">
            Espace Privilège
          </span>
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal mt-1">
            Bonjour, {customerUser?.name || 'Client Privilège'}
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light mt-1">
            Ravi de vous revoir. Voici le résumé de vos activités d'exception.
          </p>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-5 py-3 hover:bg-rose-gold transition-colors"
        >
          Découvrir les nouveautés
          <FiArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Metric Summary Widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-beige p-6 flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-blush border border-rose-gold/20 flex items-center justify-center text-rose-gold flex-shrink-0">
            <FiShoppingBag size={20} />
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray block">
              Commandes effectuées
            </span>
            <span className="font-serif text-2xl font-light text-luxury-charcoal">
              {totalOrders}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-beige p-6 flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
            <FiPackage size={20} />
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray block">
              Commandes en cours
            </span>
            <span className="font-serif text-2xl font-light text-luxury-charcoal">
              {activeOrders}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white border border-beige p-6 flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
            <FiHeart size={20} />
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray block">
              Créations en favoris
            </span>
            <span className="font-serif text-2xl font-light text-luxury-charcoal">
              {wishlistCount}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Latest Orders Widget ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-light text-luxury-charcoal">
            Dernières Commandes
          </h2>
          <Link
            to="/account/orders"
            className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-rose-gold transition-colors flex items-center gap-1"
          >
            Tout afficher <FiArrowRight size={11} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center font-sans text-xs text-warm-gray">Chargement…</div>
        ) : latestOrders.length === 0 ? (
          <div className="bg-white border border-beige p-8 text-center space-y-3">
            <FiShoppingBag size={32} className="mx-auto text-warm-gray/40" />
            <p className="font-sans text-xs text-warm-gray font-light">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-rose-gold transition-colors"
            >
              Explorer les créations
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-beige divide-y divide-beige">
            {latestOrders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-off-white/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs font-semibold text-luxury-charcoal">
                      #{ord.order_number || ord.id}
                    </span>
                    <span className="font-sans text-[10px] px-2 py-0.5 uppercase tracking-wider bg-emerald-50 text-emerald-700 font-medium">
                      {ord.status || 'Confirmée'}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-warm-gray font-light">
                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString('fr-FR') : 'Récemment'} — {ord.items_count || 1} article(s)
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-sans text-sm font-semibold text-rose-gold">
                    {formatPrice(ord.total || 0)}
                  </span>
                  <Link
                    to={`/account/orders/${ord.id}`}
                    className="font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal hover:text-rose-gold font-medium border-b border-luxury-charcoal hover:border-rose-gold transition-colors"
                  >
                    Détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reassurance Banner ── */}
      <div className="bg-white border border-beige p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FiShield size={24} className="text-rose-gold flex-shrink-0" />
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-luxury-charcoal font-semibold">
              Garantie Maison Hafrose
            </h4>
            <p className="font-sans text-[11px] text-warm-gray font-light mt-0.5">
              Service client dédié, retours offerts sous 30 jours et certificats d'authenticité fournis.
            </p>
          </div>
        </div>
        <Link
          to="/contact"
          className="font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal transition-colors whitespace-nowrap"
        >
          Contacter notre Atelier
        </Link>
      </div>
    </div>
  );
}
