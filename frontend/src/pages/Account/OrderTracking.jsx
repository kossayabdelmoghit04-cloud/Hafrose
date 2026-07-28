import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiMapPin, FiClock } from 'react-icons/fi';
import orderService from '../../services/orderService';
import OrderTimeline from '../../components/account/OrderTimeline';
import useSEO from '../../hooks/useSEO';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: `Suivi Colis #${id}`,
    description: `Suivi en temps réel de votre colis Maison Hafrose pour la commande #${id}.`,
  });

  useEffect(() => {
    orderService.getById(id)
      .then((res) => {
        if (res?.success) setOrder(res.data);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-16 text-center font-sans text-xs text-warm-gray">Chargement du suivi…</div>;

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between border-b border-beige pb-6">
        <Link to="/account/orders" className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-luxury-charcoal flex items-center gap-1.5">
          <FiArrowLeft size={12} /> Retour à mes commandes
        </Link>
      </div>

      <div>
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-rose-gold font-semibold">
          Expédition Sécurisée
        </span>
        <h1 className="font-serif text-3xl font-light text-luxury-charcoal mt-1">
          Suivi de Colis #{id}
        </h1>
        <p className="font-sans text-xs text-warm-gray font-light mt-1">
          Numéro de suivi Colissimo Expert : <span className="font-medium text-luxury-charcoal">FR-HAF-9842719-X</span>
        </p>
      </div>

      {/* Animated Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-beige p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-gold">
            <FiTruck size={20} />
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">
              État d'avancement
            </span>
          </div>
          <span className="font-sans text-xs text-emerald-700 bg-emerald-50 px-3 py-1 font-medium">
            Livraison estimée : sous 48h
          </span>
        </div>

        <OrderTimeline status={order?.status || 'shipped'} />
      </motion.div>

      {/* Detail boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-beige p-6 space-y-2">
          <div className="flex items-center gap-2 text-warm-gray">
            <FiMapPin size={16} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-luxury-charcoal">
              Adresse de destination
            </span>
          </div>
          <p className="font-sans text-xs text-luxury-charcoal font-light">
            {order?.address || '12, Avenue Montaigne, 75008 Paris'}
          </p>
        </div>

        <div className="bg-white border border-beige p-6 space-y-2">
          <div className="flex items-center gap-2 text-warm-gray">
            <FiClock size={16} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-luxury-charcoal">
              Transporteur partenaire
            </span>
          </div>
          <p className="font-sans text-xs text-luxury-charcoal font-light">
            Chronopost Express avec remise contre signature.
          </p>
        </div>
      </div>
    </div>
  );
}
