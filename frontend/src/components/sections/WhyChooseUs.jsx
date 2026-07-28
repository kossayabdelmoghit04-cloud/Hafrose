import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiCompass, FiTruck, FiAward, FiMessageCircle } from 'react-icons/fi';
import { scrollRevealProps, staggerContainer, fadeUp, scaleIn } from '../../utils/motionConfig';

const assets = [
  {
    icon: FiCompass,
    title: "Savoir-Faire Unique",
    desc: "Chaque pièce est entièrement façonnée et assemblée à la main dans nos ateliers partenaires par des artisans passionnés.",
    number: "01",
  },
  {
    icon: FiTruck,
    title: "Expédition Assurée",
    desc: "Livraison sécurisée avec signature et écrin signature offert. Emballage soigné préservant la perfection de vos pièces.",
    number: "02",
  },
  {
    icon: FiAward,
    title: "Matières Certifiées",
    desc: "Sélection rigoureuse des cuirs, métaux et pierres. Certificat d'authenticité et numéro de série unique pour chaque création.",
    number: "03",
  },
  {
    icon: FiMessageCircle,
    title: "Service Conciergerie",
    desc: "Nos conseillers sont à votre entière disposition 24/7 pour répondre à vos questions et organiser vos visites privées.",
    number: "04",
  },
];

const WhyChooseUs = memo(function WhyChooseUs() {
  return (
    <section
      className="py-28 bg-luxury-charcoal text-luxury-cream border-t border-luxury-gold/10 relative overflow-hidden"
      aria-label="Pourquoi choisir Hafrose"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(196,168,130,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="text-center space-y-4 mb-20"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            L'Engagement de la Maison
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-white font-extralight">
            Pourquoi Choisir Hafrose
          </motion.h2>
          <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold/40 w-12 mx-auto" />
        </motion.div>

        {/* Assets Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12, 0.1)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-luxury-gold/10"
        >
          {assets.map(({ icon: Icon, title, desc, number }, idx) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative p-8 md:p-10 flex flex-col gap-6 border-b border-r border-luxury-gold/10 last:border-r-0 hover:bg-luxury-gold/[0.04] transition-colors duration-500"
            >
              {/* Number */}
              <span
                className="absolute top-6 right-6 font-serif text-5xl text-luxury-gold/08 font-extralight leading-none pointer-events-none select-none"
                aria-hidden="true"
              >
                {number}
              </span>

              {/* Icon container with ring */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border border-luxury-gold/20 group-hover:border-luxury-gold/50 transition-colors duration-500" />
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon className="text-luxury-gold" size={22} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-white text-sm font-sans font-medium tracking-wide">{title}</h3>
                <p className="text-luxury-cream/50 text-xs font-sans font-light leading-relaxed">{desc}</p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="h-[1px] bg-luxury-gold/30"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.4, duration: 0.7, ease: [0.16,1,0.3,1] }}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
});

export default WhyChooseUs;
