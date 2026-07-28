import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiAward, FiLock } from 'react-icons/fi';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const trustItems = [
  {
    icon: FiShield,
    title: 'Certificat d\'Authenticité',
    desc: 'Chaque pièce est accompagnée d\'un certificat numéroté garantissant l\'authenticité des matières et de la confection.',
  },
  {
    icon: FiAward,
    title: 'Garantie à Vie Sellier',
    desc: 'Nos artisans assurent l\'entretien et la réparation des coutures et métaux précieux sans limite de temps.',
  },
  {
    icon: FiCheckCircle,
    title: 'Traçabilité Éthique',
    desc: 'Cuirs pleine fleur issus exclusivement de tanneries certifiées LWG (Leather Working Group) à faible impact.',
  },
  {
    icon: FiLock,
    title: 'Expédition Assurée VIP',
    desc: 'Transports sécurisés avec numéro de suivi dédié et remise en main propre contre signature uniquement.',
  },
];

const TrustCertificates = memo(function TrustCertificates() {
  return (
    <section
      className="py-24 bg-luxury-cream border-t border-luxury-gold/10 relative overflow-hidden"
      aria-label="Engagements et garanties Hafrose"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="text-center space-y-3 mb-16"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            Garantie & Authenticité
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-luxury-charcoal font-extralight">
            L'Engagement de Conﬁance
          </motion.h2>
          <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold w-12 mx-auto" />
        </motion.div>

        {/* Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="glass-card p-8 text-center space-y-4 border border-luxury-gold/20 hover:border-luxury-gold/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center mx-auto border border-luxury-gold/30">
                <Icon size={20} />
              </div>

              <h3 className="font-serif text-lg text-luxury-charcoal font-light">
                {title}
              </h3>

              <p className="text-xs font-sans text-luxury-gray font-light leading-relaxed">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
});

export default TrustCertificates;
