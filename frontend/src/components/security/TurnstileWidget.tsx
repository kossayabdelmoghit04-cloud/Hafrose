import { useEffect, useRef, useState } from 'react';

type WidgetState = 'loading' | 'ready' | 'expired' | 'error' | 'unavailable';

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
  action: 'checkout' | 'contact' | 'review';
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-hafrose-turnstile]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile unavailable')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.hafroseTurnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile unavailable'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function TurnstileWidget({ onTokenChange, resetKey = 0, action }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);
  const [state, setState] = useState<WidgetState>('loading');
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const isTesting = import.meta.env.VITE_APP_ENV === 'testing';

  useEffect(() => {
    callbackRef.current = onTokenChange;
  });

  useEffect(() => {
    if (!siteKey && isTesting) {
      callbackRef.current('testing-bypass');
      setState('ready');
      return;
    }

    if (!siteKey) {
      callbackRef.current(null);
      setState('unavailable');
      return;
    }

    let cancelled = false;
    setState('loading');
    callbackRef.current(null);

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          callback: (token: string) => {
            callbackRef.current(token);
            setState('ready');
          },
          'expired-callback': () => {
            callbackRef.current(null);
            setState('expired');
          },
          'error-callback': () => {
            callbackRef.current(null);
            setState('error');
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          callbackRef.current(null);
          setState('unavailable');
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, isTesting, action]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      callbackRef.current(null);
      setState('loading');
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  return (
    <div className="space-y-2" data-testid={`turnstile-${action}`}>
      <div ref={containerRef} aria-label="Vérification anti-robot" />
      {state === 'loading' && <p className="text-caption text-neutral-500">Chargement de la vérification…</p>}
      {state === 'expired' && <p role="alert" className="text-caption text-warning-700">Vérification expirée. Veuillez la renouveler.</p>}
      {state === 'error' && <p role="alert" className="text-caption text-error-600">La vérification a échoué. Veuillez réessayer.</p>}
      {state === 'unavailable' && <p role="alert" className="text-caption text-error-600">La vérification anti-robot est indisponible. La soumission est bloquée.</p>}
    </div>
  );
}
