import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiCheck, FiShield } from 'react-icons/fi';

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Carte Bancaire (Stripe)',
    sub: 'Visa, Mastercard, American Express',
    icon: FiCreditCard,
  },
  {
    id: 'paypal',
    name: 'PayPal / Express Checkout',
    sub: 'Paiement sécurisé en 1 clic',
    icon: FiLock,
  },
  {
    id: 'cod',
    name: 'Paiement à la Livraison',
    sub: 'Règlement en espèces ou chèque au transporteur',
    icon: FiShield,
  },
];

export default function PaymentSelector({ selectedMethod, onSelect }) {
  const [active, setActive] = useState(selectedMethod || 'card');

  const handleSelect = (method) => {
    setActive(method.id);
    onSelect?.(method);
  };

  return (
    <div className="space-y-6 text-left">
      <h3 className="font-serif text-lg font-light text-luxury-charcoal mb-4">
        Mode de Règlement
      </h3>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = active === method.id;

          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.005 }}
              onClick={() => handleSelect(method)}
              className={`p-5 border cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                isSelected ? 'border-rose-gold bg-white shadow-sm ring-1 ring-rose-gold/20' : 'border-beige bg-off-white hover:border-warm-gray'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${
                  isSelected ? 'border-rose-gold bg-rose-gold text-white' : 'border-warm-gray bg-white'
                }`}>
                  {isSelected && <FiCheck size={12} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-luxury-charcoal" />
                    <span className="font-sans text-xs font-semibold text-luxury-charcoal">
                      {method.name}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] font-light text-warm-gray mt-0.5">
                    {method.sub}
                  </p>
                </div>
              </div>

              <span className="font-sans text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 uppercase tracking-wider">
                Sécurisé 256-bit
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Credit Card inputs simulation when 'card' is selected */}
      {active === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-5 border border-beige bg-white space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray font-medium">
              Saisie sécurisée
            </span>
            <div className="flex gap-2 text-[10px] font-sans text-warm-gray font-semibold">
              <span>VISA</span>
              <span>MC</span>
              <span>AMEX</span>
            </div>
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
              Numéro de Carte
            </label>
            <input
              type="text"
              placeholder="4532 •••• •••• 8921"
              className="w-full border border-beige bg-off-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold tracking-widest"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                Expiration (MM/AA)
              </label>
              <input
                type="text"
                placeholder="12/28"
                className="w-full border border-beige bg-off-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                CVC / CVC2
              </label>
              <input
                type="text"
                placeholder="321"
                className="w-full border border-beige bg-off-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                maxLength={4}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
