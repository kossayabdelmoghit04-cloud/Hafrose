import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Livraison Standard Colissimo',
    delay: '3 à 5 jours ouvrés',
    price: 0,
    freeThreshold: 150,
    description: 'Livraison sécurisée avec remise contre signature dans un écrin Hafrose.',
  },
  {
    id: 'express',
    name: 'Livraison Express Chronopost',
    delay: '24 à 48 heures',
    price: 9.90,
    description: 'Expédition prioritaire pour toute commande passée avant 12h.',
  },
  {
    id: 'boutique',
    name: 'Click & Collect Atelier Paris',
    delay: 'Disponible sous 24h',
    price: 0,
    description: 'Retrait sur rendez-vous dans nos salons de l\'Avenue Montaigne.',
  },
];

export default function ShippingSelector({ cartTotal = 0, selectedMethod, onSelect }) {
  const [active, setActive] = useState(selectedMethod || SHIPPING_METHODS[0].id);

  const handleSelect = (method) => {
    setActive(method.id);
    onSelect?.(method);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-light text-luxury-charcoal text-left mb-4">
        Mode de Livraison
      </h3>

      <div className="space-y-3">
        {SHIPPING_METHODS.map((method) => {
          const isSelected = active === method.id;
          const isFree = method.price === 0 || (method.freeThreshold && cartTotal >= method.freeThreshold);

          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.005 }}
              onClick={() => handleSelect(method)}
              className={`p-5 border cursor-pointer transition-colors text-left flex items-start justify-between gap-4 ${
                isSelected ? 'border-rose-gold bg-white shadow-sm ring-1 ring-rose-gold/20' : 'border-beige bg-off-white hover:border-warm-gray'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${
                  isSelected ? 'border-rose-gold bg-rose-gold text-white' : 'border-warm-gray bg-white'
                }`}>
                  {isSelected && <FiCheck size={12} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-semibold text-luxury-charcoal">
                      {method.name}
                    </span>
                    <span className="font-sans text-[10px] text-warm-gray bg-beige/60 px-2 py-0.5 rounded">
                      {method.delay}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] font-light text-luxury-gray leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-sans text-xs font-semibold text-rose-gold">
                  {isFree ? 'Offerte' : formatPrice(method.price)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
