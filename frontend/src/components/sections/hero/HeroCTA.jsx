import { memo } from 'react';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';

const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
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

const HeroCTA = memo(function HeroCTA() {
  return (
    <motion.div
      variants={heroStagger}
      className="hero-cta-group"
      role="group"
      aria-label="Actions principales"
    >
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
  );
});

export default HeroCTA;
