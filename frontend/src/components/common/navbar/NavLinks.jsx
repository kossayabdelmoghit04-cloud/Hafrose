import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Accueil', path: '/', mega: false },
  { name: 'Boutique', path: '/shop', mega: true },
  { name: 'À Propos', path: '/about', mega: false },
  { name: 'Contact', path: '/contact', mega: false },
];

const NavLinks = memo(function NavLinks({ isMegaOpen, onMegaEnter, onMegaLeave }) {
  const location = useLocation();

  return (
    <nav className="navbar__desktop-nav" aria-label="Menu principal">
      {NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <div
            key={link.name}
            className="navbar__nav-item-wrap"
            onMouseEnter={link.mega ? onMegaEnter : undefined}
            onMouseLeave={link.mega ? onMegaLeave : undefined}
          >
            <Link
              to={link.path}
              className={`navbar__nav-link${isActive ? ' navbar__nav-link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-expanded={link.mega ? isMegaOpen : undefined}
              aria-haspopup={link.mega ? 'true' : undefined}
            >
              {link.name}
              {isActive && (
                <motion.span
                  layoutId="nav-active-bar"
                  className="navbar__nav-link-bar"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
});

export default NavLinks;
