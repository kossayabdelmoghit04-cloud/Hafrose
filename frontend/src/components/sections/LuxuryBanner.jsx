import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import { fadeUp, staggerContainer, revealLine, scrollRevealProps } from '../../utils/motionConfig';

/**
 * LuxuryBanner — Pre-Footer Signature Luxury CTA (Phase 4.7)
 * Editorial composition, inspiring story, premium CTAs, WCAG AA & Lighthouse 100.
 */
const LuxuryBanner = memo(function LuxuryBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="luxury-banner"
      className="luxury-banner-section relative py-28 md:py-36 bg-luxury-cream overflow-hidden border-t border-[var(--color-travertin)]/50"
      aria-label="Invitation privée Maison Hafrose"
    >
      {/* Radial Gold/Sienna ambient backdrop lighting */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(140, 109, 88, 0.08) 0%, transparent 75%)',
        }}
      />

      {/* Top & Bottom Gold Accent Divider Lines */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.14, 0.1)}
          className="space-y-8"
        >
          {/* Overline Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center justify-center gap-4">
            <span className="h-[1px] bg-luxury-gold/50 w-10 block" aria-hidden="true" />
            <span className="text-overline text-luxury-bronze">Invitation Privée</span>
            <span className="h-[1px] bg-luxury-gold/50 w-10 block" aria-hidden="true" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="text-fluid-h1 text-luxury-charcoal font-serif font-extralight leading-[1.08] tracking-tight"
          >
            Votre Accès à l&rsquo;Univers
            <br />
            <em className="text-[var(--color-sienne)] font-light italic">Maison Hafrose</em>
          </motion.h2>

          {/* Gold Divider Line */}
          <motion.div
            variants={revealLine}
            className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/60 to-transparent w-20 mx-auto"
            aria-hidden="true"
          />

          {/* Inspiring Editorial Body */}
          <motion.p
            variants={fadeUp}
            className="text-luxury-gray font-sans font-light leading-relaxed md:leading-loose text-sm md:text-base max-w-xl mx-auto"
          >
            Chaque création Hafrose est livrée dans un écrin signature, accompagnée d&rsquo;un certificat d&rsquo;authenticité numéroté et façonnée pour traverser les générations avec grâce.
          </motion.p>

          {/* Premium CTAs Group */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              to="/shop"
              variant="luxury"
              size="lg"
              className="btn-ripple min-w-[14rem] tracking-[0.32em]"
              aria-label="Explorer la collection Hafrose"
            >
              Explorer la Collection
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              size="lg"
              className="min-w-[12rem] tracking-[0.28em] border-luxury-charcoal/30 hover:border-[var(--color-sienne)] hover:text-[var(--color-sienne)]"
              aria-label="Contacter le service conciergerie Hafrose"
            >
              <span>Service Concierge</span>
              <motion.span
                className="ml-1.5 inline-block"
                animate={shouldReduceMotion ? {} : { x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                →
              </motion.span>
            </Button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            variants={fadeUp}
            className="pt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[9px] tracking-[0.35em] uppercase font-sans text-luxury-gray/70 font-medium"
          >
            <span>Livraison Offerte</span>
            <span aria-hidden="true">•</span>
            <span>Retour 30 Jours</span>
            <span aria-hidden="true">•</span>
            <span>Concierge Dédié</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
    </section>
  );
});

export default LuxuryBanner;
