import { useState, useEffect } from 'react';
import { grantAnalyticsConsent, revokeAnalyticsConsent } from '../../services/analytics';

/**
 * HAFROSE — GDPR/CCPA Cookie Consent Banner (Phase 5.11)
 * Non-blocking, accessible banner with granular consent preferences.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Show banner only if consent hasn't been given or denied yet
    const existing = localStorage.getItem('hafrose_analytics_consent');
    if (!existing) {
      // Delay slightly to avoid blocking initial paint
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    grantAnalyticsConsent();
    setVisible(false);
  };

  const handleDecline = () => {
    revokeAnalyticsConsent();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 left-0 right-0 z-[9000] bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-xl">
            🍪
          </div>

          {/* Content */}
          <div className="flex-1">
            <p id="cookie-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Votre vie privée nous importe
            </p>
            <p id="cookie-desc" className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience, mesurer nos performances et personnaliser nos
              communications.{' '}
              <button
                onClick={() => setExpanded(!expanded)}
                className="underline underline-offset-2 text-amber-700 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                aria-expanded={expanded}
                aria-controls="cookie-details"
              >
                {expanded ? 'Masquer les détails' : 'En savoir plus'}
              </button>
            </p>

            {/* Expanded details */}
            {expanded && (
              <div
                id="cookie-details"
                className="mt-3 space-y-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-neutral-100 dark:border-neutral-800"
              >
                <p>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Cookies essentiels</span>{' '}
                  — toujours actifs, nécessaires au bon fonctionnement du site (session, panier).
                </p>
                <p>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Cookies analytiques</span>{' '}
                  — Google Analytics 4 pour mesurer les visites et améliorer nos contenus.
                </p>
                <p>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Cookies marketing</span>{' '}
                  — Google Ads & Meta Pixel pour vous proposer des publicités personnalisées.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Refuser tous les cookies non essentiels"
            >
              Refuser
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Accepter tous les cookies"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
