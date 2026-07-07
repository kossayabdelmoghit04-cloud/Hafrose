import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiPhone, FiUser, FiCalendar, FiBox } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import { formatPrice } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  useDocumentTitle('Commande validée', 'Votre achat de créations d\'exception Hafrose a bien été enregistré. Nos artisans préparent votre colis.');

  // Fallback: If no order details in state, redirect to shop
  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 pt-36 min-h-screen text-left">
      {/* Success Animated Icon */}
      <div className="flex flex-col items-center text-center space-y-6 mb-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 bg-luxury-gold text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <FiCheck size={40} />
        </motion.div>

        <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
          Achat validé avec succès
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-luxury-charcoal font-light">
          Merci pour votre confiance
        </h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto my-4" />
        <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed max-w-lg">
          Votre commande a été transmise à notre atelier parisien. Un conseiller de la Maison Hafrose prendra soin de préparer votre colis dans un écrin signature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Order Details Card */}
        <motion.div
          {...fadeUp}
          className="md:col-span-7 bg-white border border-luxury-charcoal/5 p-6 md:p-8 space-y-6"
        >
          <h2 className="font-serif text-lg font-light text-luxury-charcoal pb-3 border-b border-luxury-charcoal/5 flex items-center gap-2">
            <FiBox size={16} className="text-luxury-gold" />
            <span>Détails de la commande</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans font-light text-luxury-gray">
            <div className="space-y-1">
              <span className="text-[9px] tracking-wider uppercase text-luxury-charcoal font-semibold">Référence</span>
              <p className="text-sm font-medium text-luxury-charcoal">#HAF-{order.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] tracking-wider uppercase text-luxury-charcoal font-semibold">Date</span>
              <p className="flex items-center gap-1">
                <FiCalendar size={12} />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] tracking-wider uppercase text-luxury-charcoal font-semibold">Destinataire</span>
              <p className="flex items-center gap-1 text-luxury-charcoal font-medium">
                <FiUser size={12} />
                {order.customer_name}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] tracking-wider uppercase text-luxury-charcoal font-semibold">Téléphone</span>
              <p className="flex items-center gap-1">
                <FiPhone size={12} />
                {order.phone}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-luxury-charcoal/5 space-y-2">
            <span className="text-[9px] tracking-wider uppercase text-luxury-charcoal font-semibold block">Adresse de livraison</span>
            <div className="flex items-start gap-2 text-xs text-luxury-gray font-light">
              <FiMapPin size={14} className="text-luxury-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-luxury-charcoal font-medium">{order.address}</p>
                <p>{order.city}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Summary (Items & Total) */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:col-span-5 bg-white border border-luxury-charcoal/5 p-6 space-y-6"
        >
          <h2 className="font-serif text-lg font-light text-luxury-charcoal pb-3 border-b border-luxury-charcoal/5">
            Résumé des articles
          </h2>

          <div className="divide-y divide-luxury-charcoal/5 max-h-[250px] overflow-y-auto pr-1">
            {order.order_items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-serif text-xs font-medium text-luxury-charcoal">
                    {item.product?.name || `Produit #${item.product_id}`}
                  </h4>
                  <p className="text-[10px] text-luxury-gray font-sans font-light mt-0.5">
                    Quantité : {item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
                <span className="font-sans font-medium text-luxury-charcoal">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-luxury-charcoal/5 pt-4 space-y-3">
            <div className="flex justify-between text-xs text-luxury-gray">
              <span>Livraison</span>
              <span className="text-[10px] uppercase text-green-600 font-semibold tracking-wider">Offerte</span>
            </div>
            <div className="flex justify-between items-center border-t border-luxury-charcoal/5 pt-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">Total payé</span>
              <span className="text-sm font-semibold text-luxury-gold">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 text-center">
        <Button to="/shop" variant="primary">
          Retourner à la Boutique
        </Button>
      </div>
    </div>
  );
}
