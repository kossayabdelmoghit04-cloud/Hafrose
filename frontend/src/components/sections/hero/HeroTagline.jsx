import { memo } from 'react';
import { motion } from 'framer-motion';

const eyebrowVariant = {
  hidden: { opacity: 0, letterSpacing: '0.3em' },
  visible: {
    opacity: 1,
    letterSpacing: '0.5em',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
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

const HeroTagline = memo(function HeroTagline() {
  return (
    <>
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

      <motion.p variants={editorialReveal} className="hero-tagline">
        L&rsquo;art d&rsquo;associer la pureté du geste artisanal
        <br className="hidden sm:block" />
        à l&rsquo;audace créative contemporaine.
      </motion.p>
    </>
  );
});

export default HeroTagline;
