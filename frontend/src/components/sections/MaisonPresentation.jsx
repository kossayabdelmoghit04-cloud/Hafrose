import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../ui/Card';
import { fadeUp, slideLeft, revealLine, staggerContainer } from '../../utils/motionConfig';

const MaisonPresentation = memo(function MaisonPresentation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="about-maison"
      className="about-section py-28 md:py-36 bg-luxury-cream overflow-hidden relative border-y border-[var(--color-travertin)]/50"
      aria-label="Présentation de la Maison Hafrose"
    >
      {/* Subtle grid background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--color-rose-gold) 0, var(--color-rose-gold) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, var(--color-rose-gold) 0, var(--color-rose-gold) 1px, transparent 1px, transparent 80px)',
        }}
      />

      {/* Soft ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(140, 109, 88, 0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Side: Editorial Storytelling */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.12, 0.1)}
          className="lg:col-span-7 space-y-8"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-3">
            <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
            <span className="text-overline text-luxury-bronze">Notre Philosophie</span>
            <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={fadeUp}
            className="text-fluid-h1 text-luxury-charcoal font-serif font-extralight leading-[1.08] tracking-tight"
          >
            L'excellence du geste<br />
            <em className="text-[var(--color-sienne)] font-light italic">et la noblesse</em><br />
            des matières
          </motion.h2>

          {/* Gold Divider */}
          <motion.div
            variants={revealLine}
            className="h-[1px] bg-gradient-to-r from-luxury-gold via-luxury-gold/60 to-transparent w-16"
            aria-hidden="true"
          />

          {/* Narrative Paragraphs */}
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            className="space-y-6 text-luxury-gray font-sans font-light leading-relaxed md:leading-loose text-sm md:text-base max-w-2xl"
          >
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

          {/* Heritage Signature Block */}
          <motion.div
            variants={fadeUp}
            className="pt-6 flex flex-wrap items-center gap-6 border-t border-[var(--color-travertin)]/60"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full border border-luxury-gold/40 flex items-center justify-center font-serif text-lg text-luxury-charcoal select-none bg-luxury-cream shadow-sm"
                aria-hidden="true"
              >
                H
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-luxury-gold font-sans font-semibold">
                  Maison fondée en 2018
                </div>
                <div className="text-[9px] tracking-[0.3em] uppercase text-luxury-gray/60 font-sans mt-1">
                  Paris, France
                </div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[var(--color-travertin)] hidden sm:block" aria-hidden="true" />

            <div className="flex items-center gap-4 md:gap-6 text-[9px] tracking-[0.3em] uppercase text-luxury-gray/70 font-sans font-medium">
              <span>Fait Main</span>
              <span>•</span>
              <span>Cuir Pleine Fleur</span>
              <span>•</span>
              <span>Paris</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Luxury Statement Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduceMotion ? {} : slideLeft}
          className="lg:col-span-5 relative pt-6 lg:pt-0"
        >
          <Card
            variant="flat"
            className="aspect-[4/5] bg-luxury-charcoal flex flex-col justify-between p-8 md:p-12 text-luxury-cream border border-luxury-gold/25 shadow-2xl relative overflow-hidden group rounded-none"
          >
            {/* Ambient dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/40 pointer-events-none" aria-hidden="true" />

            {/* Header Badge */}
            <div className="relative z-10 text-[9px] tracking-[0.5em] uppercase text-luxury-gold font-sans font-semibold flex items-center justify-between">
              <span>Maison Fondée en 2018</span>
              <span className="w-2 h-2 rounded-full bg-[var(--color-sienne)]" aria-hidden="true" />
            </div>

            {/* Quote Body */}
            <div className="relative z-10 space-y-6 my-auto">
              <span
                className="font-serif text-8xl text-white/10 font-extralight block select-none leading-none -mb-10"
                aria-hidden="true"
              >
                H
              </span>
              <blockquote className="relative z-10">
                <p className="text-editorial text-lg md:text-xl text-luxury-cream/95 leading-relaxed font-light italic">
                  &ldquo;Nous ne créons pas de simples objets, nous façonnons des compagnons de vie, témoins de vos plus beaux instants.&rdquo;
                </p>
              </blockquote>
            </div>

            {/* Footer Ateliers tag */}
            <div className="relative z-10 text-[10px] tracking-[0.3em] uppercase text-luxury-cream/40 font-sans pt-4 border-t border-white/10 flex items-center justify-between">
              <span>Hafrose Ateliers, Paris</span>
              <span className="text-luxury-gold font-serif italic text-xs">Haute Maroquinerie</span>
            </div>
          </Card>

          {/* Corner frame accents */}
          <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-luxury-gold/50 pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-luxury-gold/50 pointer-events-none" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
});

export default MaisonPresentation;
