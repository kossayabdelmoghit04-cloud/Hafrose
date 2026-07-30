import { memo } from 'react';
import { motion } from 'framer-motion';

const HeroScrollCue = memo(function HeroScrollCue() {
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
});

export default HeroScrollCue;
