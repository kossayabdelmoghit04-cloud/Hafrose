import { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiDroplet, FiTruck, FiFileText } from 'react-icons/fi';

/**
 * ProductTabs — HAFROSE Design System Phase 3
 * Onglets animés pour la fiche produit : Description, Caractéristiques, Entretien, Livraison.
 * Utilise Framer Motion pour l'underline animé et le cross-fade de contenu.
 */

const TABS = [
  { id: 'description', label: 'Description', icon: FiFileText },
  { id: 'characteristics', label: 'Caractéristiques', icon: FiPackage },
  { id: 'care', label: 'Entretien', icon: FiDroplet },
  { id: 'delivery', label: 'Livraison', icon: FiTruck },
];

const contentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ── Tab Content Panels ──────────────────────────────────────────── */

function DescriptionPanel({ product }) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-sm font-light text-luxury-gray leading-relaxed">
        {product?.description || "Cette création d'exception a été façonnée à la main par les artisans de la Maison Hafrose. Chaque pièce est unique et porte l'empreinte du savoir-faire ancestral de nos ateliers."}
      </p>
      <div className="border-l-2 border-rose-gold pl-5">
        <p className="font-serif text-sm italic text-luxury-charcoal font-light leading-relaxed">
          « Nous créons des objets qui traversent le temps, pensés pour accompagner chaque moment de votre vie. »
        </p>
        <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray mt-2 block">
          — Maison Hafrose
        </span>
      </div>
    </div>
  );
}

function CharacteristicsPanel({ product }) {
  const specs = [
    { label: 'Matière', value: product?.material || 'Cuir de veau grainé' },
    { label: 'Coloris', value: product?.color || 'Voir les variantes' },
    { label: 'Dimensions', value: product?.dimensions || '30 × 22 × 12 cm' },
    { label: 'Poids', value: product?.weight || '480 g' },
    { label: 'Origine', value: 'Fabriqué en France' },
    { label: 'Finition', value: 'Dorures à l\'or fin 24 carats' },
    { label: 'Référence', value: product?.slug ? `HAF-${product.slug.toUpperCase().slice(0, 6)}` : 'HAF-001' },
  ].filter(s => s.value);

  return (
    <div className="space-y-0">
      {specs.map((spec, idx) => (
        <div
          key={spec.label}
          className={`flex items-start justify-between py-3.5 ${idx < specs.length - 1 ? 'border-b border-beige' : ''}`}
        >
          <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray font-medium w-1/3">
            {spec.label}
          </span>
          <span className="font-sans text-sm font-light text-luxury-charcoal text-right w-2/3">
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CarePanel() {
  const instructions = [
    {
      icon: '💧',
      title: 'Hydratation',
      text: 'Appliquez une crème nourrissante spéciale cuir une fois par mois pour préserver la souplesse du matériau.',
    },
    {
      icon: '☀️',
      title: 'Protection Solaire',
      text: 'Évitez l\'exposition prolongée au soleil et à la chaleur directe afin de conserver l\'intensité des teintes.',
    },
    {
      icon: '💧',
      title: 'Humidité',
      text: 'En cas de contact avec l\'eau, séchez délicatement à l\'aide d\'un chiffon doux. N\'utilisez jamais de sèche-cheveux.',
    },
    {
      icon: '🧴',
      title: 'Nettoyage',
      text: 'Utilisez un chiffon légèrement humide pour les taches légères. Pour un entretien approfondi, confiez votre pièce à un professionnel.',
    },
    {
      icon: '📦',
      title: 'Rangement',
      text: 'Conservez votre création dans sa housse en coton fournie, à l\'abri de la lumière directe.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {instructions.map((item) => (
        <div key={item.title} className="flex gap-4 p-4 bg-off-white border border-beige">
          <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-luxury-charcoal font-semibold mb-1">
              {item.title}
            </h4>
            <p className="font-sans text-xs font-light text-warm-gray leading-relaxed">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliveryPanel() {
  const options = [
    {
      label: 'Livraison Standard',
      delay: '3 à 5 jours ouvrés',
      price: 'Offerte dès 150 €',
      detail: 'Expédiée dans un emballage cadeau signé Maison Hafrose.',
    },
    {
      label: 'Livraison Express',
      delay: '24 à 48 heures',
      price: '9,90 €',
      detail: 'Commande passée avant 12h00 (jours ouvrés).',
    },
    {
      label: 'Click & Collect',
      delay: 'Disponible en boutique',
      price: 'Gratuit',
      detail: 'Récupérez votre création directement dans nos ateliers parisiens.',
    },
  ];

  return (
    <div className="space-y-4">
      {options.map((opt, idx) => (
        <div key={idx} className="flex gap-5 p-4 border border-beige bg-off-white">
          <div className="w-2 flex-shrink-0 bg-rose-gold/40 self-stretch" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-sans text-xs uppercase tracking-widest text-luxury-charcoal font-semibold">
                  {opt.label}
                </h4>
                <p className="font-sans text-xs font-light text-warm-gray mt-0.5">{opt.delay}</p>
              </div>
              <span className="font-sans text-xs font-medium text-rose-gold whitespace-nowrap">{opt.price}</span>
            </div>
            <p className="font-sans text-[11px] font-light text-luxury-gray mt-2 leading-relaxed">{opt.detail}</p>
          </div>
        </div>
      ))}

      <p className="font-sans text-[10px] uppercase tracking-widest text-warm-gray text-center pt-2">
        Retours gratuits sous 14 jours — Garantie satisfait ou remboursé
      </p>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

const ProductTabs = memo(function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const tabsRef = useRef([]);

  const PANELS = {
    description: <DescriptionPanel product={product} />,
    characteristics: <CharacteristicsPanel product={product} />,
    care: <CarePanel />,
    delivery: <DeliveryPanel />,
  };

  return (
    <section className="mt-20 border-t border-beige pt-16" aria-label="Informations produit">
      {/* ── Tab Navigation ── */}
      <div
        role="tablist"
        aria-label="Sections du produit"
        className="flex flex-wrap gap-0 border-b border-beige relative"
      >
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              ref={(el) => (tabsRef.current[idx] = el)}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-4 font-sans text-[10px] uppercase tracking-widest font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-1 ${
                isActive ? 'text-luxury-charcoal' : 'text-warm-gray hover:text-luxury-charcoal'
              }`}
            >
              <Icon size={13} aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>

              {/* Animated underline */}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-gold"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Panels ── */}
      <div className="mt-10 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {PANELS[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
});

export default ProductTabs;
