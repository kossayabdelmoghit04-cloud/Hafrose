import { memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiStar } from 'react-icons/fi';

/**
 * MegaMenu — HAFROSE Design System Phase 2
 * Menu déroulant grand format pour desktop.
 * Ergonomie luxe, navigation clavier (Escape, Tab, Flèches), WCAG 2.2 AA.
 */

const MEGA_CATEGORIES = [
  {
    title: 'Collections',
    items: [
      { name: 'Nouveautés Automne', path: '/shop?category=nouveautes', badge: 'New' },
      { name: 'Les Intemporels', path: '/shop?category=intemporels' },
      { name: 'Édition Limitée', path: '/shop?category=edition-limitee', badge: 'Rare' },
      { name: 'Sélection Cadeaux', path: '/shop?category=cadeaux' },
    ],
  },
  {
    title: 'Sacs & Maroquinerie',
    items: [
      { name: 'Sacs à main', path: '/shop?category=sacs-a-main' },
      { name: 'Sacs bandoulière', path: '/shop?category=sacs-bandouliere' },
      { name: 'Cabas & Shopping', path: '/shop?category=cabas' },
      { name: 'Pochettes du soir', path: '/shop?category=pochettes' },
    ],
  },
  {
    title: 'Petite Maroquinerie',
    items: [
      { name: 'Portefeuilles', path: '/shop?category=portefeuilles' },
      { name: 'Porte-cartes', path: '/shop?category=porte-cartes' },
      { name: 'Étuis & Compagnons', path: '/shop?category=etuis' },
      { name: 'Porte-clés de luxe', path: '/shop?category=porte-cles' },
    ],
  },
  {
    title: 'Bijoux & Accessoires',
    items: [
      { name: 'Montres d\'exception', path: '/shop?category=montres' },
      { name: 'Bijoux & Manchette', path: '/shop?category=bijoux' },
      { name: 'Lunettes de soleil', path: '/shop?category=lunettes' },
      { name: 'Ceintures en cuir', path: '/shop?category=ceintures' },
      { name: 'Pièces en promotion', path: '/shop?category=promotions', badge: 'Offres' },
    ],
  },
];

const FEATURED_PIECE = {
  title: 'Le Sac L\'Équilibre',
  subtitle: 'Cuir Grainé Rose Poudré — Fait Main à Paris',
  price: '890 €',
  image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
  path: '/shop?search=Equilibre',
};

const MegaMenu = memo(function MegaMenu({ isOpen, onClose, onMouseEnter, onMouseLeave }) {
  const containerRef = useRef(null);

  // Gestion Escape & Clic extérieur
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          key="megamenu"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="mega-menu"
          role="region"
          aria-label="Catalogue Collections & Catégories"
        >
          <div className="mega-menu__inner">
            {/* Grille des catégories (4 colonnes) */}
            <div className="mega-menu__grid">
              {MEGA_CATEGORIES.map((cat, idx) => (
                <div key={cat.title} className="mega-menu__col">
                  <h3 className="mega-menu__title">
                    {cat.title}
                  </h3>
                  <ul className="mega-menu__list" role="list">
                    {cat.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className="mega-menu__link"
                        >
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className={`mega-menu__badge${item.badge === 'Offres' ? ' mega-menu__badge--accent' : ''}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Carte Produit Vedette (Right side highlight) */}
            <div className="mega-menu__featured">
              <div className="mega-menu__featured-card">
                <div className="mega-menu__featured-img-wrap">
                  <img
                    src={FEATURED_PIECE.image}
                    alt={FEATURED_PIECE.title}
                    className="mega-menu__featured-img"
                    loading="lazy"
                  />
                  <span className="mega-menu__featured-tag">
                    <FiStar size={11} className="mr-1 inline" />
                    Coup de Cœur
                  </span>
                </div>

                <div className="mega-menu__featured-body">
                  <h4 className="mega-menu__featured-title">
                    {FEATURED_PIECE.title}
                  </h4>
                  <p className="mega-menu__featured-sub">
                    {FEATURED_PIECE.subtitle}
                  </p>

                  <div className="mega-menu__featured-footer">
                    <span className="mega-menu__featured-price">
                      {FEATURED_PIECE.price}
                    </span>
                    <Link
                      to={FEATURED_PIECE.path}
                      onClick={onClose}
                      className="mega-menu__featured-cta"
                    >
                      <span>Découvrir</span>
                      <FiArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MegaMenu;
