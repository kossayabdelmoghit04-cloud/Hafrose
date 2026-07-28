import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer, scrollRevealProps } from '../../utils/motionConfig';

/**
 * LuxuryBanner — Editorial minimal banner with gradient surface + signature CTA
 */
export default function LuxuryBanner() {
  return (
    <section
      className="relative py-24 md:py-32 bg-luxury-cream overflow-hidden"
      aria-label="Invitation privée Hafrose"
    >
      {/* Gold gradient background accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(196,168,130,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Horizontal gold lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.15, 0.1)}
          className="space-y-8"
        >
          {/* Overline */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6">
            <span className="h-[1px] bg-luxury-gold/40 w-16 block" />
            <span className="text-overline">Invitation Privée</span>
            <span className="h-[1px] bg-luxury-gold/40 w-16 block" />
          </motion.div>

          {/* Headline */}
          <motion.h2 variants={fadeUp} className="text-fluid-h1 text-luxury-charcoal font-extralight">
            Votre Accès à l'Univers
            <br />
            <em className="text-luxury-gold not-italic font-light">Hafrose</em>
          </motion.h2>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            className="h-[1px] bg-luxury-gold/40 w-12 mx-auto"
          />

          {/* Body */}
          <motion.p variants={fadeUp} className="text-luxury-gray font-sans font-light leading-relaxed max-w-xl mx-auto text-sm md:text-base">
            Chaque commande Hafrose est livrée dans un écrin signature accompagné d'un certificat
            d'authenticité numéroté et d'une lettre manuscrite de notre équipe.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-luxury-charcoal text-luxury-cream text-[10px] tracking-[0.35em] uppercase font-sans font-medium border border-luxury-charcoal hover:bg-transparent hover:text-luxury-charcoal transition-all duration-500"
            >
              Voir la Collection
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-transparent text-luxury-charcoal text-[10px] tracking-[0.35em] uppercase font-sans font-medium border border-luxury-charcoal/30 hover:border-luxury-gold hover:text-luxury-gold transition-all duration-500"
            >
              Nous Contacter
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 pt-4 opacity-50">
            {['Livraison Offerte', 'Retour 30J', 'Paiement Sécurisé'].map((item) => (
              <span key={item} className="text-[9px] tracking-[0.3em] uppercase font-sans text-luxury-charcoal">
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
