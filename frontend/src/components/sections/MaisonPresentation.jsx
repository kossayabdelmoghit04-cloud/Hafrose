import { memo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { fadeUp, slideRight, slideLeft, revealLine, staggerContainer } from '../../utils/motionConfig';

const MaisonPresentation = memo(function MaisonPresentation() {
  return (
    <section
      className="py-28 bg-luxury-cream overflow-hidden relative"
      aria-label="Présentation de la Maison Hafrose"
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--color-luxury-gold) 0, var(--color-luxury-gold) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, var(--color-luxury-gold) 0, var(--color-luxury-gold) 1px, transparent 1px, transparent 80px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-16 items-center relative z-10">

        {/* Left Side: Editorial Typography */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.12, 0.1)}
          className="md:col-span-7 space-y-8"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            Notre Philosophie
          </motion.span>

          <motion.h2 variants={fadeUp} className="text-fluid-h1 text-luxury-charcoal font-extralight leading-tight">
            L'excellence du geste<br />
            <em className="text-luxury-gold not-italic font-light">et la noblesse</em><br />
            des matières
          </motion.h2>

          <motion.div variants={revealLine} className="h-[1px] bg-luxury-gold w-12" />

          <motion.div variants={staggerContainer(0.15, 0.1)} className="space-y-5 text-luxury-gray font-sans font-light leading-relaxed text-sm">
            <motion.p variants={fadeUp}>
              Fondée sur la promesse d'une élégance intemporelle, la Maison Hafrose incarne l'héritage
              d'un savoir-faire d'exception. Chaque création naît d'une rencontre entre l'excellence
              technique de nos artisans et des matières rigoureusement sélectionnées.
            </motion.p>
            <motion.p variants={fadeUp}>
              Des cuirs pleine fleur d'une souplesse incomparable aux métaux précieux finement polis,
              chaque détail est pensé pour résister aux modes et traverser les générations.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
            <div className="text-signature text-luxury-charcoal/20 leading-none select-none" aria-hidden="true">H</div>
            <div>
              <div className="text-[9px] tracking-[0.4em] uppercase text-luxury-gold font-sans font-semibold">Maison fondée en 2018</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-luxury-gray/60 font-sans mt-1">Paris, France</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Decorative Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={slideLeft}
          className="md:col-span-5 relative"
        >
          <Card
            variant="flat"
            className="aspect-[4/5] bg-luxury-charcoal flex flex-col justify-between p-8 md:p-12 text-luxury-cream border border-luxury-gold/20 depth-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-shimmer opacity-40 pointer-events-none" aria-hidden="true" />

            <div className="relative z-10 text-[9px] tracking-[0.5em] uppercase text-luxury-gold font-sans font-semibold">
              Maison Fondée en 2018
            </div>

            <div className="relative z-10 space-y-6">
              <span className="font-serif text-8xl text-white font-extralight opacity-10 block select-none leading-none" aria-hidden="true">
                H
              </span>
              <blockquote>
                <p className="text-editorial text-base md:text-lg text-luxury-cream/90 leading-relaxed font-light">
                  "Nous ne créons pas de simples objets, nous façonnons des compagnons de vie, témoins de vos plus beaux instants."
                </p>
              </blockquote>
            </div>

            <div className="relative z-10 text-[10px] tracking-widest uppercase text-luxury-cream/30 font-sans">
              Hafrose Ateliers, Paris
            </div>
          </Card>

          {/* Accent corner lines */}
          <div className="absolute -top-4 -right-4 w-16 h-16 border-t border-r border-luxury-gold/40 pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b border-l border-luxury-gold/40 pointer-events-none" aria-hidden="true" />
        </motion.div>

      </div>
    </section>
  );
});

export default MaisonPresentation;
