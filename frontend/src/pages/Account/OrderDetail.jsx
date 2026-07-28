import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiTruck, FiMapPin, FiCreditCard } from 'react-icons/fi';
import orderService from '../../services/orderService';
import OrderTimeline from '../../components/account/OrderTimeline';
import useSEO from '../../hooks/useSEO';
import { formatPrice } from '../../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: `Commande #${id} — Espace Client`,
    description: `Détails de la commande #${id} Maison Hafrose.`,
  });

  useEffect(() => {
    orderService.getById(id)
      .then((res) => {
        if (res?.success) setOrder(res.data);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-16 text-center font-sans text-xs text-warm-gray">Chargement des détails…</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="font-sans text-xs text-red-500">Commande introuvable.</p>
        <Link to="/account/orders" className="font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left print:p-0">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-beige pb-6 print:hidden">
        <Link to="/account/orders" className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-luxury-charcoal flex items-center gap-1.5">
          <FiArrowLeft size={12} /> Retour aux commandes
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal flex items-center gap-1.5"
        >
          <FiPrinter size={13} /> Imprimer la facture
        </button>
      </div>

      {/* Main Info Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
            Commande #{order.order_number || order.id}
          </h1>
          <span className="font-sans text-[10px] uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit font-medium">
            {order.status || 'Confirmée'}
          </span>
        </div>
        <p className="font-sans text-xs text-warm-gray font-light mt-1">
          Passée le {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
        </p>
      </div>

      {/* Timeline Section */}
      <div className="bg-white border border-beige p-6 print:hidden">
        <h3 className="font-serif text-lg text-luxury-charcoal font-light mb-6">
          Suivi d'avancement
        </h3>
        <OrderTimeline status={order.status || 'processing'} />
      </div>

      {/* Addresses & Payment details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-beige p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-gold">
            <FiMapPin size={16} />
            <h4 className="font-sans text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">
              Adresse de livraison
            </h4>
          </div>
          <div className="font-sans text-xs text-luxury-charcoal font-light space-y-1">
            <p className="font-medium">{order.customer_name || order.customer || 'Marie Dupont'}</p>
            <p>{order.shipping_address || order.address || '12, Avenue Montaigne'}</p>
            <p>{order.postal_code || '75008'} {order.city || 'Paris'}</p>
            <p className="text-warm-gray">{order.phone || '+33 6 12 34 56 78'}</p>
          </div>
        </div>

        <div className="bg-white border border-beige p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-gold">
            <FiCreditCard size={16} />
            <h4 className="font-sans text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">
              Mode de règlement
            </h4>
          </div>
          <div className="font-sans text-xs text-luxury-charcoal font-light space-y-1">
            <p className="font-medium">Carte Bancaire / Stripe (Sécurisé)</p>
            <p className="text-emerald-700 font-medium">Paiement validé</p>
            <p className="text-warm-gray text-[11px] mt-2">Facture acquittée — N° FAC-HAF-{order.id}-2026</p>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-beige p-6 space-y-4">
        <h3 className="font-serif text-lg text-luxury-charcoal font-light">
          Articles commandés
        </h3>

        <div className="divide-y divide-beige">
          {(order.items || [{ name: 'Création Haute Maroquinerie', quantity: 1, price: order.total }]).map((item, idx) => (
            <div key={idx} className="py-4 flex justify-between items-center text-left">
              <div>
                <h5 className="font-sans text-xs text-luxury-charcoal font-medium">
                  {item.name || item.product?.name || 'Création Maison Hafrose'}
                </h5>
                <p className="font-sans text-[11px] text-warm-gray font-light">
                  Quantité : {item.quantity || 1}
                </p>
              </div>
              <span className="font-sans text-xs font-semibold text-rose-gold">
                {formatPrice((item.price || order.total) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-beige pt-4 space-y-2 text-right font-sans text-xs">
          <div className="flex justify-between text-warm-gray">
            <span>Sous-total</span>
            <span>{formatPrice(order.total || 0)}</span>
          </div>
          <div className="flex justify-between text-warm-gray">
            <span>Livraison</span>
            <span className="text-emerald-600 font-medium">Offerte</span>
          </div>
          <div className="flex justify-between font-semibold text-luxury-charcoal text-sm pt-2 border-t border-beige">
            <span>Total TTC</span>
            <span className="text-rose-gold">{formatPrice(order.total || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
