import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiBox, FiTruck, FiHome, FiXCircle } from 'react-icons/fi';

const STAGES = [
  { key: 'pending', label: 'Commande reçue', icon: FiClock },
  { key: 'confirmed', label: 'Confirmée', icon: FiCheck },
  { key: 'processing', label: 'Préparation en atelier', icon: FiBox },
  { key: 'shipped', label: 'Expédiée', icon: FiTruck },
  { key: 'delivered', label: 'Livrée', icon: FiHome },
];

export default function OrderTimeline({ status = 'pending', className = '' }) {
  if (status === 'cancelled') {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-center gap-3 ${className}`}>
        <FiXCircle size={18} />
        <span>Cette commande a été annulée.</span>
      </div>
    );
  }

  // Determine current active stage index
  const statusIndexMap = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  };

  const currentIndex = statusIndexMap[status] ?? 1;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-beige -translate-y-1/2 -z-0" />
        <motion.div
          className="absolute top-1/2 left-4 h-0.5 bg-rose-gold -translate-y-1/2 -z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Steps */}
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? 'bg-luxury-charcoal border-luxury-charcoal text-off-white'
                    : 'bg-white border-beige text-warm-gray'
                } ${isCurrent ? 'ring-4 ring-rose-gold/20' : ''}`}
              >
                <Icon size={14} />
              </motion.div>
              <span
                className={`font-sans text-[10px] uppercase tracking-wider mt-2 text-center max-w-[80px] ${
                  isCurrent ? 'font-semibold text-luxury-charcoal' : 'text-warm-gray font-light'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
