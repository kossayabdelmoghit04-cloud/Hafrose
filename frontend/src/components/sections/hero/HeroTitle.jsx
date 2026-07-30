import { memo } from 'react';
import { motion } from 'framer-motion';
import { charRevealContainer, charRevealChild, revealLine } from '../../../utils/motionConfig';

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

const HeroTitle = memo(function HeroTitle({ title = 'HAFROSE' }) {
  return (
    <>
      <motion.h1
        variants={charRevealContainer}
        className="hero-title"
        style={{ perspective: '900px' }}
      >
        <SplitChars text={title} className="hero-title-chars" />
      </motion.h1>

      <motion.div
        variants={revealLine}
        className="hero-gold-divider"
        aria-hidden="true"
      />
    </>
  );
});

export default HeroTitle;
