/**
 * HAFROSE v2.1 — useScrollReveal
 * Wrapper over Framer Motion whileInView for consistent scroll-triggered animations.
 * Returns props to spread directly onto motion elements.
 */
import { useReducedMotion } from 'framer-motion';

/**
 * @param {object} options
 * @param {string} options.variant - 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
 * @param {number} options.delay - delay in seconds
 * @param {number} options.distance - px offset (default 30)
 * @param {string} options.margin - viewport margin (default '-80px')
 */
export default function useScrollReveal({
  variant = 'up',
  delay = 0,
  distance = 30,
  margin = '-80px',
} = {}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true },
      transition: { duration: 0.1, delay },
    };
  }

  const variants = {
    up:    { initial: { opacity: 0, y: distance },  animate: { opacity: 1, y: 0 } },
    down:  { initial: { opacity: 0, y: -distance }, animate: { opacity: 1, y: 0 } },
    left:  { initial: { opacity: 0, x: distance },  animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -distance }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.9 },   animate: { opacity: 1, scale: 1 } },
    fade:  { initial: { opacity: 0 },               animate: { opacity: 1 } },
  };

  const chosen = variants[variant] || variants.up;

  return {
    initial: chosen.initial,
    whileInView: chosen.animate,
    viewport: { once: true, margin },
    transition: {
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  };
}
