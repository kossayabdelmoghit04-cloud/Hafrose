/**
 * HAFROSE v2.1 — Luxury Motion System
 * Global animation tokens and reusable Framer Motion variants.
 * All animations respect prefers-reduced-motion via Framer's MotionConfig.
 */

/* ─────────────────────────────────────────────────────────────
   EASINGS
───────────────────────────────────────────────────────────── */
export const ease = {
  luxury:     [0.16, 1, 0.3, 1],
  smooth:     [0.25, 1, 0.5, 1],
  spring:     { type: 'spring', stiffness: 400, damping: 30 },
  springBounce: { type: 'spring', stiffness: 600, damping: 25 },
  springGentle: { type: 'spring', stiffness: 200, damping: 28 },
  elastic:    { type: 'spring', stiffness: 800, damping: 20, mass: 0.5 },
  inertia:    { type: 'inertia', velocity: 200 },
};

/* ─────────────────────────────────────────────────────────────
   DURATIONS (seconds)
───────────────────────────────────────────────────────────── */
export const duration = {
  instant:  0.1,
  fast:     0.2,
  normal:   0.4,
  slow:     0.7,
  xslow:    1.0,
  hero:     1.2,
};

/* ─────────────────────────────────────────────────────────────
   PAGE TRANSITION
───────────────────────────────────────────────────────────── */
export const pageTransition = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
  transition: { duration: duration.normal, ease: ease.luxury },
};

/* ─────────────────────────────────────────────────────────────
   STAGGER CONTAINERS
───────────────────────────────────────────────────────────── */
export const staggerContainer = (staggerChild = 0.08, delayStart = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerChild,
      delayChildren: delayStart,
    },
  },
});

export const staggerFast = staggerContainer(0.05);
export const staggerMedium = staggerContainer(0.1);
export const staggerSlow = staggerContainer(0.15);

/* ─────────────────────────────────────────────────────────────
   CHILDREN VARIANTS
───────────────────────────────────────────────────────────── */
export const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.luxury },
  },
};

export const fadeDown = {
  hidden:  { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.luxury },
  },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.luxury },
  },
};

export const slideLeft = {
  hidden:  { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.luxury },
  },
};

export const slideRight = {
  hidden:  { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.luxury },
  },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: ease.luxury },
  },
};

export const scaleInSpring = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ease.springBounce,
  },
};

export const revealLine = {
  hidden:  { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: duration.slow, ease: ease.luxury, delay: 0.3 },
  },
};

/* ─────────────────────────────────────────────────────────────
   HOVER / TAP
───────────────────────────────────────────────────────────── */
export const hoverLift = {
  whileHover: { y: -4, transition: ease.spring },
  whileTap:   { scale: 0.97 },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: ease.spring },
  whileTap:   { scale: 0.97 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 20px 60px -10px rgba(181, 130, 140, 0.30)',
    transition: { duration: 0.3 },
  },
};

/* ─────────────────────────────────────────────────────────────
   DRAWER / MODAL
───────────────────────────────────────────────────────────── */
export const drawerRight = {
  hidden:  { x: '100%', opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...ease.springGentle, duration: 0.5 },
  },
  exit:    {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.3, ease: ease.smooth },
  },
};

export const backdropFade = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL (viewport-aware)
───────────────────────────────────────────────────────────── */
export const scrollRevealProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};

/* ─────────────────────────────────────────────────────────────
   LAYOUT ANIMATION
───────────────────────────────────────────────────────────── */
export const layoutTransition = {
  layout: true,
  layoutId: undefined, // override per-component
  transition: ease.springGentle,
};

/* ─────────────────────────────────────────────────────────────
   SHARED ELEMENT
───────────────────────────────────────────────────────────── */
export function sharedElement(id) {
  return {
    layoutId: id,
    transition: ease.springGentle,
  };
}

/* ─────────────────────────────────────────────────────────────
   TEXT REVEAL (character-by-character)
───────────────────────────────────────────────────────────── */
export const charRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

export const charRevealChild = {
  hidden:  { opacity: 0, y: 20, rotateX: -30 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.5, ease: ease.luxury },
  },
};

/* ─────────────────────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────────────────────── */
export const counterVariant = {
  hidden:  { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ease.springBounce,
  },
};
