import { useRef, memo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import HeroBackground from './hero/HeroBackground';
import HeroContent from './hero/HeroContent';
import HeroScrollCue from './hero/HeroScrollCue';
import HeroFrame from './hero/HeroFrame';

/**
 * Hero — HAFROSE Luxury Hero Section (Phase L1.2 Architecture)
 * Expérience cinématique haut de gamme avec animation de parallaxe GPU,
 * révélation typographique par lettres, conteneur éditorial et ornements d'angle.
 */
const Hero = memo(function Hero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  /* Parallax transforms — GPU-only (no layout recalculation) */
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
      {/* Background Image Parallax & Cinematic Scrim Overlay */}
      <HeroBackground bgY={bgY} containerRef={containerRef} />

      {/* Editorial Content Container */}
      <HeroContent textY={textY} fadeOut={fadeOut} />

      {/* Animated Scroll Cue */}
      <HeroScrollCue />

      {/* Luxury Frame Corner Ornaments */}
      <HeroFrame />
    </section>
  );
});

export default Hero;
