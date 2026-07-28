import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiCreditCard, FiCheck } from 'react-icons/fi';

const STEPS = [
  { id: 1, label: 'Panier', icon: FiShoppingBag },
  { id: 2, label: 'Livraison', icon: FiTruck },
  { id: 3, label: 'Paiement', icon: FiCreditCard },
  { id: 4, label: 'Confirmation', icon: FiCheck },
];

export default function CheckoutStepper({ currentStep = 1, onStepClick }) {
  return (
    <div className="w-full py-6 mb-10 border-b border-beige">
      <div className="max-w-2xl mx-auto flex items-center justify-between relative">
        {/* Track Line */}
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-beige -translate-y-1/2 -z-0" />
        <motion.div
          className="absolute top-1/2 left-6 h-0.5 bg-rose-gold -translate-y-1/2 -z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Steps */}
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={step.id > currentStep}
              onClick={() => onStepClick?.(step.id)}
              className={`relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed ${
                step.id > currentStep ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-rose-gold border-rose-gold text-white'
                    : isCurrent
                    ? 'bg-luxury-charcoal border-luxury-charcoal text-white ring-4 ring-rose-gold/20'
                    : 'bg-white border-beige text-warm-gray'
                }`}
              >
                {isCompleted ? <FiCheck size={14} /> : <Icon size={14} />}
              </div>
              <span
                className={`font-sans text-[10px] uppercase tracking-wider mt-2 ${
                  isCurrent ? 'font-semibold text-luxury-charcoal' : 'text-warm-gray font-light'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
