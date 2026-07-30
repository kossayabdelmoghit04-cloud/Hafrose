import { useState, useEffect } from 'react';

/**
 * HAFROSE — PWA Install Prompt Banner (Phase 5.10)
 * Non-intrusive installation prompt that appears after user engagement.
 */
export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch((err) => console.warn('[PWA] Service Worker registration failed:', err));
      });
    }

    // Capture beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner 3 seconds after page load to avoid immediate distraction
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide if already installed
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal in session
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (!showBanner || sessionStorage.getItem('pwa-dismissed')) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-title"
      aria-describedby="pwa-desc"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-off-white border border-luxury-gold/30 shadow-2xl p-5 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-12 h-12 rounded-none bg-luxury-charcoal flex items-center justify-center flex-shrink-0 border border-luxury-gold/40">
        <img src="/favicon.svg" alt="Hafrose" className="w-7 h-7" />
      </div>

      <div className="flex-1 min-w-0">
        <p id="pwa-title" className="font-serif text-sm text-luxury-charcoal font-light tracking-wide">
          Installer Maison Hafrose
        </p>
        <p id="pwa-desc" className="font-sans text-[11px] text-warm-gray mt-0.5 leading-relaxed">
          Accès rapide, expérience offline & services privilèges.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="px-3.5 py-2 bg-luxury-charcoal text-off-white text-[9px] uppercase tracking-widest font-sans font-medium hover:bg-rose-gold transition-colors"
          aria-label="Installer l'application Hafrose"
        >
          Installer
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3.5 py-1 text-warm-gray text-[9px] uppercase tracking-widest font-sans hover:text-luxury-charcoal transition-colors"
          aria-label="Fermer la bannière d'installation"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
