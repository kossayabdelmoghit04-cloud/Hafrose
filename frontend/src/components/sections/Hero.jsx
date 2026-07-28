import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { fadeUp, staggerContainer, charRevealContainer, charRevealChild, revealLine } from '../../utils/motionConfig';

/* ── Helpers ── */
function SplitChars({ text, className }) {
  return (
    <motion.span
      variants={charRevealContainer}
      className={className}
      style={{ display: 'inline-block' }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={charRevealChild}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function ScrollCue() {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <span className="text-[8px] tracking-[0.5em] uppercase text-luxury-cream/50 font-sans">Défiler</span>
      <motion.div
        className="w-[1px] h-10 bg-gradient-to-b from-luxury-gold/60 to-transparent"
        animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ── Dynamic cursor light ── */
function CursorLight({ containerRef }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const shouldReduceMotion = useReducedMotion();

  const onMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldReduceMotion) return;
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [onMove, containerRef, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2] transition-[background] duration-700"
      style={{
        background: `radial-gradient(ellipse 40% 40% at ${pos.x}% ${pos.y}%, rgba(196,168,130,0.12) 0%, transparent 70%)`,
      }}
      aria-hidden="true"
    />
  );
}

/* ── Main Component ── */
export default function Hero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  // Parallax: background moves up slower than scroll
  const bgY = useTransform(scrollY, [0, 600], ['0%', '20%']);
  const textY = useTransform(scrollY, [0, 600], ['0%', '-8%']);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const heroVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[95vh] min-h-[640px] w-full overflow-hidden bg-luxury-charcoal flex items-center justify-center"
      aria-label="Hafrose — Maison de Haute Maroquinerie"
    >
      {/* ── Parallax Background ── */}
      <motion.div
        className="absolute inset-0 scale-[1.12]"
        style={{ y: shouldReduceMotion ? 0 : bgY }}
      >
        <img
          src="/images/hero.png"
          alt=""
          role="presentation"
          className="w-full h-full object-cover object-center"
          fetchpriority="high"
          decoding="async"
        />
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 gradient-hero-overlay" />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ── Dynamic Cursor Light ── */}
      <CursorLight containerRef={containerRef} />

      {/* ── Hero Content ── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center text-luxury-cream"
        style={{ y: shouldReduceMotion ? 0 : textY, opacity: shouldReduceMotion ? 1 : opacity }}
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Overline badge */}
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-3 text-overline">
            <motion.span
              className="inline-block h-[1px] bg-luxury-gold/60"
              style={{ width: 24 }}
              animate={{ width: 32, opacity: [0.4, 1] }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.16,1,0.3,1] }}
            />
            Maison de Haute Maroquinerie
            <motion.span
              className="inline-block h-[1px] bg-luxury-gold/60"
              style={{ width: 24 }}
              animate={{ width: 32, opacity: [0.4, 1] }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.16,1,0.3,1] }}
            />
          </span>
        </motion.div>

        {/* Title — character reveal */}
        <motion.h1
          variants={charRevealContainer}
          className="text-fluid-hero uppercase text-white mb-0 font-extralight"
          style={{ perspective: '800px' }}
        >
          <SplitChars text="HAFROSE" className="text-fluid-hero font-extralight tracking-[0.25em]" />
        </motion.h1>

        {/* Gold divider line */}
        <motion.div
          variants={revealLine}
          className="h-[1px] bg-luxury-gold/60 mx-auto mt-6 mb-8"
          style={{ originX: 0, width: 48 }}
        />

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="text-editorial text-luxury-cream/75 max-w-lg mx-auto text-base md:text-lg mb-10"
        >
          "L'art d'associer la pureté du geste artisanal à l'audace créative contemporaine."
        </motion.p>

        {/* CTA Group */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            to="/shop"
            variant="luxury"
            size="lg"
            className="btn-ripple depth-gold"
          >
            Découvrir la Collection
          </Button>
          <Button
            to="/about"
            variant="secondary"
            size="lg"
            className="border-luxury-cream/40 text-luxury-cream hover:bg-luxury-cream/10 hover:border-luxury-cream"
          >
            Notre Maison →
          </Button>
        </motion.div>

        {/* Bottom decorative stats */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex items-center justify-center gap-12 opacity-60"
        >
          {[
            { n: '2018', label: 'Fondée' },
            { n: '500+', label: 'Créations' },
            { n: '40+', label: 'Pays' },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <div className="font-serif text-white text-xl font-light">{n}</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-luxury-cream/50 font-sans mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll Cue ── */}
      <ScrollCue />

      {/* ── Corner decorators ── */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-luxury-gold/25 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-luxury-gold/25 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-luxury-gold/25 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-luxury-gold/25 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
