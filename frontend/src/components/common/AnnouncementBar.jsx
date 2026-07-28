import { useState, useEffect, memo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/**
 * AnnouncementBar — HAFROSE Design System Phase 2
 * Bannière promotionnelle rotative avec timer bar, pause au hover/focus,
 * et respect strict de prefers-reduced-motion.
 */

const MESSAGES = [
  {
    id: 'shipping',
    text: 'Livraison offerte en France métropolitaine dès 150 €',
    cta: null,
  },
  {
    id: 'new',
    text: 'Nouvelle collection Automne — Découvrez nos pièces d\'exception',
    cta: { label: 'Explorer', href: '/shop' },
  },
  {
    id: 'secure',
    text: 'Paiement 100 % sécurisé — Retours gratuits sous 14 jours',
    cta: null,
  },
];

const ROTATION_INTERVAL = 5000;

const AnnouncementBar = memo(function AnnouncementBar() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('hafrose_announcement_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Détecter prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Rotation automatique & timer bar
  useEffect(() => {
    if (!visible || isPaused || prefersReducedMotion || MESSAGES.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
      setProgressKey((k) => k + 1);
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, [visible, isPaused, prefersReducedMotion]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem('hafrose_announcement_dismissed', 'true');
    } catch {}
  }, []);

  if (!visible) return null;

  const currentMessage = MESSAGES[currentIndex];

  return (
    <div
      className="announcement-bar"
      role="banner"
      aria-label="Annonces promotionnelles"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
    >
      {/* Message rotatif */}
      <div className="announcement-bar__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="announcement-bar__message"
          >
            <span className="announcement-bar__text">
              {currentMessage.text}
            </span>

            {currentMessage.cta && (
              <a
                href={currentMessage.cta.href}
                className="announcement-bar__cta"
                aria-label={`${currentMessage.cta.label} — ${currentMessage.text}`}
              >
                {currentMessage.cta.label}
                <span aria-hidden="true" className="ml-1">→</span>
              </a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timer Progress Bar (Phase 2) */}
      {!prefersReducedMotion && MESSAGES.length > 1 && !isPaused && (
        <motion.div
          key={`timer-${currentIndex}-${progressKey}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: ROTATION_INTERVAL / 1000, ease: 'linear' }}
          className="announcement-bar__timer-line"
          aria-hidden="true"
        />
      )}

      {/* Dots de navigation */}
      {MESSAGES.length > 1 && (
        <div
          className="announcement-bar__dots"
          role="tablist"
          aria-label="Messages promotionnels"
        >
          {MESSAGES.map((msg, idx) => (
            <button
              key={msg.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Message ${idx + 1} sur ${MESSAGES.length}`}
              onClick={() => {
                setCurrentIndex(idx);
                setProgressKey((k) => k + 1);
              }}
              className={`announcement-bar__dot${idx === currentIndex ? ' announcement-bar__dot--active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Bouton de fermeture */}
      <button
        type="button"
        onClick={handleDismiss}
        className="announcement-bar__close"
        aria-label="Fermer la bannière d'annonces"
      >
        <FiX size={14} aria-hidden="true" />
      </button>
    </div>
  );
});

export default AnnouncementBar;
