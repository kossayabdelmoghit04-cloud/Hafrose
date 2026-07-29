import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import Button from '../ui/Button';
import {
  charRevealContainer,
  charRevealChild,
  revealLine,
} from '../../utils/motionConfig';

/* ─────────────────────────────────────────────────────────────
   Local animation variants (hero-specific, not shared globally)
───────────────────────────────────────────────────────────── */
const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
  },
};

const editorialReveal = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const eyebrowVariant = {
  hidden: { opacity: 0, letterSpacing: '0.3em' },
  visible: {
    opacity: 1,
    letterSpacing: '0.5em',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const ctaPrimary = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const ctaSecondary = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─────────────────────────────────────────────────────────────
   SplitChars — character-by-character title reveal
───────────────────────────────────────────────────────────── */
function SplitChars({ text, className }) {
  return (
    <motion.span
      variants={charRevealContainer}
      className={className}
      style={{ display: 'inline-block' }}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={charRevealChild}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
          aria-hidden="true"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────────────────────
   ScrollCue — animated scroll indicator
───────────────────────────────────────────────────────────── */
function ScrollCue() {
  return (
    <motion.div
      className="hero-scroll-cue"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <span className="hero-scroll-label">Défiler</span>
      <motion.div
        className="hero-scroll-line"
        animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 3.0 }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CursorLight — subtle radial light following cursor
───────────────────────────────────────────────────────────── */
function CursorLight({ containerRef }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const shouldReduceMotion = useReducedMotion();

  const onMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [containerRef]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldReduceMotion) return;
    el.addEventListener('mousemove', onMove, { passive: true });
    return () => el.removeEventListener('mousemove', onMove);
  }, [onMove, containerRef, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2]"
      style={{
        background: `radial-gradient(ellipse 45% 45% at ${pos.x}% ${pos.y}%, rgba(140,109,88,0.10) 0%, transparent 72%)`,
        transition: 'background 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   GoldDivider — expanding horizontal rule
───────────────────────────────────────────────────────────── */
function GoldDivider() {
  return (
    <motion.div
      variants={revealLine}
      className="hero-gold-divider"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   HeroStats — three editorial key figures
───────────────────────────────────────────────────────────── */
const STATS = [
  { n: '2018', label: 'Fondée' },
  { n: '500+', label: 'Créations' },
  { n: '40+', label: 'Pays' },
];

function HeroStats() {
  return (
    <motion.div
      variants={editorialReveal}
      className="hero-stats"
      role="list"
      aria-label="Chiffres clés de la Maison Hafrose"
    >
      {STATS.map(({ n, label }, idx) => (
        <div key={label} className="hero-stat" role="listitem">
          {idx > 0 && <span className="hero-stat-sep" aria-hidden="true" />}
          <span className="hero-stat-number">{n}</span>
          <span className="hero-stat-label">{label}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Hero Component
───────────────────────────────────────────────────────────── */
export default function Hero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  /* Parallax transforms — GPU-only (no layout trigger) */
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ['0%', '18%']);
  const textY = useTransform(scrollY, [0, 700], ['0%', '-10%']);
  const fadeOut = useTransform(scrollY, [0, 420], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="hero-section"
      aria-label="Hafrose — Maison de Haute Maroquinerie"
      id="hero"
    >
      {/* ── Parallax Background Image ── */}
      <motion.div
        className="hero-bg"
        style={{ y: shouldReduceMotion ? 0 : bgY }}
      >
        <img
          src="/images/hero.png"
          alt=""
          role="presentation"
          className="hero-bg-img"
          fetchpriority="high"
          decoding="async"
          loading="eager"
        />

        {/* Multi-layer cinematic overlay — builds depth without killing image */}
        {/* Layer 1 — Base darkening scrim */}
        <div className="hero-overlay-base" aria-hidden="true" />
        {/* Layer 2 — Directional gradient (bottom-heavy for text legibility) */}
        <div className="hero-overlay-gradient" aria-hidden="true" />
        {/* Layer 3 — Vignette ring */}
        <div className="hero-overlay-vignette" aria-hidden="true" />
        {/* Layer 4 — Subtle grain texture (aesthetic depth) */}
        <div className="hero-overlay-grain" aria-hidden="true" />
      </motion.div>

      {/* ── Dynamic Cursor Light ── */}
      <CursorLight containerRef={containerRef} />

      {/* ── Hero Content — Editorial Grid ── */}
      <motion.div
        className="hero-content"
        style={{ y: shouldReduceMotion ? 0 : textY, opacity: shouldReduceMotion ? 1 : fadeOut }}
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        {/* ─ Eyebrow / Overline ─ */}
        <motion.div variants={eyebrowVariant} className="hero-eyebrow-wrap">
          <span className="hero-eyebrow" aria-label="Maison de Haute Maroquinerie">
            <motion.span
              className="hero-eyebrow-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
            <span>Maison de Haute Maroquinerie</span>
            <motion.span
              className="hero-eyebrow-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
          </span>
        </motion.div>

        {/* ─ Main Title — character reveal ─ */}
        <motion.h1
          variants={charRevealContainer}
          className="hero-title"
          style={{ perspective: '900px' }}
        >
          <SplitChars text="HAFROSE" className="hero-title-chars" />
        </motion.h1>

        {/* ─ Gold Divider ─ */}
        <GoldDivider />

        {/* ─ Editorial Tagline ─ */}
        <motion.p variants={editorialReveal} className="hero-tagline">
          L&rsquo;art d&rsquo;associer la pureté du geste artisanal
          <br className="hidden sm:block" />
          à l&rsquo;audace créative contemporaine.
        </motion.p>

        {/* ─ CTA Group ─ */}
        <motion.div
          variants={heroStagger}
          className="hero-cta-group"
          role="group"
          aria-label="Actions principales"
        >
          {/* Primary CTA */}
          <motion.div variants={ctaPrimary} className="hero-cta-primary-wrap">
            <Button
              to="/shop"
              variant="luxury"
              size="lg"
              className="hero-cta-primary"
              aria-label="Découvrir la collection Hafrose"
            >
              Découvrir la Collection
            </Button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div variants={ctaSecondary} className="hero-cta-secondary-wrap">
            <Button
              to="/about"
              variant="secondary"
              size="lg"
              className="hero-cta-secondary"
              aria-label="En savoir plus sur la Maison Hafrose"
            >
              <span>Notre Maison</span>
              <motion.span
                className="hero-cta-arrow"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                aria-hidden="true"
              >
                →
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* ─ Key Figures / Stats ─ */}
        <HeroStats />
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <ScrollCue />

      {/* ── Corner Decorators (Luxury Frame) ── */}
      <motion.div
        className="hero-corner hero-corner--tl"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="hero-corner hero-corner--tr"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="hero-corner hero-corner--bl"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="hero-corner hero-corner--br"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
    </section>
  );
}
