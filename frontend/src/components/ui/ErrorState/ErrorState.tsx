import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  className?: string;
  /**
   * Explicitly mark this error as a network/offline error.
   * When true, the WifiOff icon is shown regardless of navigator.onLine.
   * When false (default), navigator.onLine is used reactively via events.
   */
  isNetworkError?: boolean;
}

/**
 * ErrorState
 * Reusable API error display — shown instead of blank screens.
 * Used by all data-driven page sections.
 *
 * FIX: navigator.onLine is now tracked reactively via online/offline events
 * instead of being read statically at render time. This prevents falsely
 * showing the "offline" icon when the browser IS connected but an API request
 * fails for an unrelated reason (CORS, 401, 500, timeout, etc.).
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.',
  onRetry,
  fullPage = false,
  className = '',
  isNetworkError = false,
}) => {
  // Reactive online state — initialised from navigator.onLine and kept
  // up-to-date via the browser's online/offline events.
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show the offline icon only when the browser is truly offline
  // OR when the caller explicitly signals a network-level error.
  // A failed API request (4xx, 5xx, CORS) must NOT trigger this.
  const showOfflineIcon = isNetworkError || !isOnline;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 py-12 space-y-4 ${
        fullPage ? 'min-h-[50vh]' : ''
      } ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-full bg-error-50 border border-error-100 flex items-center justify-center">
        {showOfflineIcon ? (
          <WifiOff className="w-8 h-8 text-error-500" />
        ) : (
          <AlertCircle className="w-8 h-8 text-error-500" />
        )}
      </div>

      <div className="space-y-2 max-w-sm">
        <h3 className="font-serif text-h4 text-neutral-950">{title}</h3>
        <p className="text-body-sm text-neutral-600 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Réessayer
        </Button>
      )}
    </div>
  );
};
