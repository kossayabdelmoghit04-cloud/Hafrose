import React from 'react';
import { SmartRetryUI } from './SmartRetryUI';

/**
 * HAFROSE — Resilient State Wrapper (Phase 13)
 * 
 * Standardizes loading states across the application:
 * - Initial Loading (Luxury skeleton or spinner)
 * - Background Refreshing indicator
 * - Empty Data state
 * - Offline / Error recovery fallback
 */
export function ResilientStateWrapper({
  isLoading,
  isError,
  isRefreshing,
  isEmpty,
  error,
  onRetry,
  skeleton,
  emptyMessage = 'Aucun élément trouvé.',
  children,
}) {
  // 1. Initial Loading State
  if (isLoading) {
    if (skeleton) return skeleton;
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-3 animate-pulse">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-serif text-amber-200/60">
          Chargement Maison Hafrose...
        </span>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="py-12 px-6 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl space-y-4">
        <p className="text-sm text-neutral-300">
          {error?.message || 'Une erreur est survenue lors du chargement des données.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg shadow-md transition-all"
          >
            Réessayer
          </button>
        )}
        <SmartRetryUI isRetrying={false} error={error} onManualRetry={onRetry} />
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <div className="py-16 text-center text-neutral-400 font-serif italic text-sm">
        {emptyMessage}
      </div>
    );
  }

  // 4. Data Ready (With optional background refresh badge)
  return (
    <div className="relative">
      {isRefreshing && (
        <div className="absolute top-2 right-2 z-10 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-300 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Mise à jour en arrière-plan...
        </div>
      )}
      {children}
    </div>
  );
}
