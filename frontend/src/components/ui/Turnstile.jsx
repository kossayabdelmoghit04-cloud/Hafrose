import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

/**
 * Composant Cloudflare Turnstile Réutilisable
 *
 * Ce composant gère l'injection dynamique du script Cloudflare Turnstile,
 * le rendu du widget et la transmission sécurisée du token de vérification.
 *
 * Props:
 * - onVerify: (token) => void (Appelé quand le CAPTCHA est validé)
 * - onExpire: () => void (Appelé quand le token Turnstile expire)
 * - onError: () => void (Appelé en cas d'erreur de rendu ou réseau de Turnstile)
 */
const Turnstile = forwardRef(({ onVerify, onExpire, onError }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  // Exposer la méthode de réinitialisation (reset) au parent via la ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.error('Erreur lors du reset de Turnstile:', e);
        }
      }
    }
  }));

  useEffect(() => {
    let active = true;

    const initTurnstile = () => {
      if (!window.turnstile || !containerRef.current || !active) return;

      try {
        // Supprimer l'ancien widget s'il existe
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => {
            if (active && onVerify) {
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (active && onExpire) {
              onExpire();
            }
          },
          'error-callback': () => {
            if (active && onError) {
              onError();
            }
          }
        });
      } catch (err) {
        console.error('Erreur d\'initialisation Turnstile:', err);
      }
    };

    // Chargement dynamique et asynchrone du script si absent du DOM
    if (!window.turnstile) {
      const scriptId = 'cloudflare-turnstile-script';
      let script = document.getElementById(scriptId);

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      // Attente que le script soit chargé et window.turnstile disponible
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          initTurnstile();
        }
      }, 100);

      script.addEventListener('load', initTurnstile);

      return () => {
        clearInterval(checkInterval);
        script.removeEventListener('load', initTurnstile);
      };
    } else {
      initTurnstile();
    }

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignorer les erreurs d'unmount
        }
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
