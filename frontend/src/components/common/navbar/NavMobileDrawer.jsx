import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const NAV_LINKS = [
  { name: 'Accueil', path: '/' },
  { name: 'Boutique', path: '/shop' },
  { name: 'À Propos', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const NavMobileDrawer = memo(function NavMobileDrawer({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer-left"
    >
      <Modal.Backdrop />
      <Modal.Container id="mobile-drawer" className="mobile-drawer">
        <div className="mobile-drawer__header">
          <Link
            to="/"
            className="mobile-drawer__logo"
            onClick={onClose}
            aria-label="HAFROSE — Accueil"
          >
            <span className="mobile-drawer__logo-name">HAFROSE</span>
            <span className="mobile-drawer__logo-tagline">Haute Maroquinerie</span>
          </Link>
          <Modal.CloseButton className="mobile-drawer__close" />
        </div>

        <nav className="mobile-drawer__nav" aria-label="Menu mobile">
          {NAV_LINKS.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={link.path}
                  onClick={onClose}
                  className={`mobile-drawer__nav-link${isActive ? ' mobile-drawer__nav-link--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="mobile-drawer__nav-link-text">{link.name}</span>
                  {isActive && (
                    <span className="mobile-drawer__nav-link-dot" aria-hidden="true" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mobile-drawer__footer">
          <p className="mobile-drawer__footer-label">
            Maison de Luxe Parisienne
          </p>
          <Button
            to="/shop"
            variant="primary"
            size="sm"
            fullWidth
            onClick={onClose}
          >
            Explorer la boutique
          </Button>
        </div>
      </Modal.Container>
    </Modal>
  );
});

export default NavMobileDrawer;
