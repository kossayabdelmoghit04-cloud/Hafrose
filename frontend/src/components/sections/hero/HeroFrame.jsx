import { memo } from 'react';
import { motion } from 'framer-motion';

const HeroFrame = memo(function HeroFrame() {
  return (
    <>
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
    </>
  );
});

export default HeroFrame;
