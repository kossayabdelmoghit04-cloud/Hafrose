import { memo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const MaisonPresentation = memo(function MaisonPresentation() {
  return (
    <section className="py-24 bg-luxury-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Editorial Typography */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 space-y-6"
        >
          <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            Notre Philosophie
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-luxury-charcoal font-light leading-tight">
            L'excellence du geste et la noblesse des matières
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold my-4" />
          <div className="space-y-4 text-sm text-luxury-gray font-sans font-light leading-relaxed">
            <p>
              Fondée sur la promesse d'une élégance intemporelle, la Maison Hafrose incarne l'héritage d'un savoir-faire d'exception. Chaque création naît d'une rencontre entre l'excellence technique de nos artisans et des matières rigoureusement sélectionnées.
            </p>
            <p>
              Des cuirs pleine fleur d'une souplesse incomparable aux métaux précieux finement polis, chaque détail est pensé pour résister aux modes et traverser les générations. Nos artisans apportent un soin méticuleux à chaque piqûre, chaque sertissage, garantissant des pièces uniques au caractère affirmé.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Decorative Luxury Panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 relative"
        >
          <Card
            variant="flat"
            className="aspect-[4/5] bg-luxury-charcoal flex flex-col justify-between p-8 md:p-12 text-luxury-cream border border-luxury-gold/20 shadow-card-floating"
          >
            <div className="text-[9px] tracking-[0.5em] uppercase text-luxury-gold font-sans font-semibold">
              Maison Fondée en 2026
            </div>
            <div className="space-y-4">
              <span className="font-serif text-5xl md:text-6xl text-white font-extralight opacity-20 block select-none">
                H
              </span>
              <p className="font-serif italic text-base md:text-lg text-luxury-cream/90 leading-relaxed font-light">
                "Nous ne créons pas de simples objets, nous façonnons des compagnons de vie, témoins de vos plus beaux instants."
              </p>
            </div>
            <div className="text-[10px] tracking-widest uppercase text-luxury-cream/40 font-sans">
              Hafrose Ateliers, Paris
            </div>
          </Card>
          {/* Accent gold corner lines */}
          <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-luxury-gold/45 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-luxury-gold/45 pointer-events-none" />
        </motion.div>

      </div>
    </section>
  );
});

export default MaisonPresentation;

