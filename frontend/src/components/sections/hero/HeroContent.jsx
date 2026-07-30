import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import HeroTagline from './HeroTagline';
import HeroTitle from './HeroTitle';
import HeroCTA from './HeroCTA';
import HeroStats from './HeroStats';

const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
  },
};

const HeroContent = memo(function HeroContent({ textY, fadeOut }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="hero-content"
      style={{ y: shouldReduceMotion ? 0 : textY, opacity: shouldReduceMotion ? 1 : fadeOut }}
      variants={heroStagger}
      initial="hidden"
      animate="visible"
    >
      <HeroTagline />
      <HeroTitle title="HAFROSE" />
      <HeroCTA />
      <HeroStats />
    </motion.div>
  );
});

export default HeroContent;
