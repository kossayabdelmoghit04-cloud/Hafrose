import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../../services/network/useNetworkStatus';
import { FiWifiOff, FiRefreshCw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

/**
 * HAFROSE — Smart Retry UI Banner/Modal (Phase 7)
 * 
 * Luxury interactive network status indicator:
 * - Shows countdown timer on automatic retries
 * - Allows manual "Retry Now" action
 * - Displays diagnostic details on slow connection / offline mode
 * - Never shows raw technical Laravel errors to users
 */
export function SmartRetryUI({ isRetrying, retryCount, maxRetries = 3, onManualRetry, onCancel, error }) {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();
  const [countdown, setCountdown] = useState(3);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (isRetrying && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isRetrying, countdown]);

  if (isOnline && !isRetrying && !error) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-fade-in">
      <div className="bg-neutral-900/95 backdrop-blur-md border border-amber-500/30 text-white rounded-xl shadow-2xl p-5 overflow-hidden">
        {/* Top Indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <FiWifiOff className="w-5 h-5" />
              </div>
            ) : isRetrying ? (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-spin">
                <FiRefreshCw className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
            )}

            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wide text-amber-100 uppercase">
                {!isOnline
                  ? 'Mode Hors Connexion'
                  : isRetrying
                  ? 'Reconnexion en cours...'
                  : 'Connexion Instable'}
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                {!isOnline
                  ? 'Vos actions sont enregistrées en sécurité et seront synchronisées dès le retour du réseau.'
                  : isRetrying
                  ? `Tentative d'accès ${retryCount}/${maxRetries} dans ${countdown}s`
                  : error?.message || 'Une instabilité réseau a été détectée sur nos serveurs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-xs text-neutral-400 hover:text-amber-300 transition-colors underline underline-offset-4"
          >
            {showDiagnostics ? 'Masquer le diagnostic' : 'Diagnostic réseau'}
          </button>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
            )}
            {onManualRetry && (
              <button
                onClick={() => {
                  setCountdown(3);
                  onManualRetry();
                }}
                className="px-4 py-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                Réessayer
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Panel */}
        {showDiagnostics && (
          <div className="mt-3 p-3 bg-black/40 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
            <div className="flex justify-between">
              <span>État Réseau:</span>
              <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type de Signal:</span>
              <span className="text-amber-300">{effectiveType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Connexion Lente:</span>
              <span className={isSlowConnection ? 'text-amber-400' : 'text-emerald-400'}>
                {isSlowConnection ? 'OUI' : 'NON'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Code Réponse API:</span>
              <span className="text-neutral-400">{error?.status || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
