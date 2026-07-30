import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavBrand = memo(function NavBrand() {
  return (
    <div className="navbar__logo-wrap">
      <Link
        to="/"
        className="navbar__logo"
        aria-label="HAFROSE — Accueil"
      >
        <motion.span
          className="navbar__logo-name"
          whileHover={{
            scale: 1.02,
            rotate: 0.5,
            letterSpacing: '0.3em',
            textShadow: '0 0 16px rgba(181, 130, 140, 0.45)',
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          HAFROSE
        </motion.span>
        <span className="navbar__logo-tagline" aria-hidden="true">
          Haute Maroquinerie
        </span>
      </Link>
    </div>
  );
});

export default NavBrand;
