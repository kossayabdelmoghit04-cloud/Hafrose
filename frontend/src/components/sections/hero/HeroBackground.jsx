import { memo, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroBackground — Layer Visuel Parallaxe, Overlay Multi-Couches & Grain
 */
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
        background: `radial-gradient(ellipse 45% 45% at ${pos.x}% ${pos.y}%, rgba(140,109,88,0.12) 0%, transparent 72%)`,
        transition: 'background 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
      aria-hidden="true"
    />
  );
}

const HeroBackground = memo(function HeroBackground({ bgY, containerRef }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
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

        {/* Multi-layer cinematic overlay — depth & contrast */}
        <div className="hero-overlay-base" aria-hidden="true" />
        <div className="hero-overlay-gradient" aria-hidden="true" />
        <div className="hero-overlay-vignette" aria-hidden="true" />
        <div className="hero-overlay-grain" aria-hidden="true" />
      </motion.div>

      {/* Dynamic Cursor Light */}
      <CursorLight containerRef={containerRef} />
    </>
  );
});

export default HeroBackground;
