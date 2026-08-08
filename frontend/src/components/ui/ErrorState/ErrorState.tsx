import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  className?: string;
}

/**
 * ErrorState
 * Reusable API error display — shown instead of blank screens.
 * Used by all data-driven page sections.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.',
  onRetry,
  fullPage = false,
  className = '',
}) => {
  const isOffline = !navigator.onLine;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 py-12 space-y-4 ${
        fullPage ? 'min-h-[50vh]' : ''
      } ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-full bg-error-50 border border-error-100 flex items-center justify-center">
        {isOffline ? (
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
