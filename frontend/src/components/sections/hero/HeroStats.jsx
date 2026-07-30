import { memo } from 'react';
import { motion } from 'framer-motion';

const editorialReveal = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const STATS = [
  { n: '2018', label: 'Fondée' },
  { n: '500+', label: 'Créations' },
  { n: '40+', label: 'Pays' },
];

const HeroStats = memo(function HeroStats() {
  return (
    <motion.div
      variants={editorialReveal}
      className="hero-stats"
      role="list"
      aria-label="Chiffres clés de la Maison Hafrose"
    >
      {STATS.map(({ n, label }, idx) => (
        <div key={label} className="hero-stat" role="listitem">
          {idx > 0 && <span className="hero-stat-sep" aria-hidden="true" />}
          <span className="hero-stat-number">{n}</span>
          <span className="hero-stat-label">{label}</span>
        </div>
      ))}
    </motion.div>
  );
});

export default HeroStats;
