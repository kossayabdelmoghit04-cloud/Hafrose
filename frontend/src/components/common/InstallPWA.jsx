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
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
        <img src="/favicon.svg" alt="Hafrose" className="w-8 h-8" />
      </div>

      <div className="flex-1 min-w-0">
        <p id="pwa-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Installer Maison Hafrose
        </p>
        <p id="pwa-desc" className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
          Accès rapide, expérience offline et notifications.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Installer l'application Hafrose"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-neutral-400 text-xs font-medium hover:text-neutral-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Fermer la bannière d'installation"
        >
          Non merci
        </button>
      </div>
    </div>
  );
}
