import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer, scrollRevealProps } from '../../utils/motionConfig';

/**
 * LookbookBanner — Immersive editorial full-width section
 * Full-screen parallax with cinematic overlay + CTA
 */
export default function LookbookBanner() {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden w-full"
      style={{ height: 'min(90vh, 800px)' }}
      aria-label="Lookbook Hafrose"
    >
      {/* Parallax BG */}
      <motion.div
        className="absolute inset-0 scale-[1.1]"
        style={{ y: shouldReduceMotion ? 0 : bgY }}
      >
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt=""
          role="presentation"
          className="w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 gradient-hero-overlay" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        style={{ y: shouldReduceMotion ? 0 : textY }}
      >
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12, 0.1)}
          className="space-y-6 max-w-3xl"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            Édition Limitée 2026
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-fluid-h1 text-white font-extralight leading-none"
          >
            L'Élégance à l'État Pur
          </motion.h2>

          <motion.div
            variants={fadeUp}
            className="h-[1px] bg-luxury-gold/60 w-12 mx-auto"
            style={{ originX: 0 }}
          />

          <motion.p variants={fadeUp} className="text-editorial text-luxury-cream/70 text-base max-w-xl mx-auto">
            Chaque pièce de notre lookbook raconte une histoire — celle de l'artisan qui l'a façonnée,
            et de la femme ou l'homme qui la portera.
          </motion.p>

          <motion.div variants={fadeUp} className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-[10px] tracking-[0.5em] uppercase text-luxury-gold hover:text-white font-sans font-semibold transition-colors duration-500 group"
            >
              <span>Explorer le Lookbook</span>
              <span className="h-[1px] bg-current w-8 group-hover:w-12 transition-all duration-500" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-luxury-gold/30 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
