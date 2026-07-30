import React from 'react';
import { useNetworkStatus } from '../../../services/network/useNetworkStatus';
import { FiWifiOff } from 'react-icons/fi';

/**
 * HAFROSE — Network Boundary Wrapper (Phase 11)
 * 
 * Provides an offline overlay or fallback when no network signal is detected,
 * allowing users to view cached data or see clear luxury offline guidance.
 */
export function NetworkBoundary({ children, offlineFallback }) {
  const { isOnline } = useNetworkStatus();

  if (!isOnline && offlineFallback) {
    return offlineFallback;
  }

  return (
    <>
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-800/40 text-amber-200 text-xs py-2 px-4 text-center font-mono flex items-center justify-center gap-2">
          <FiWifiOff className="w-4 h-4 text-amber-400" />
          <span>Mode Hors Connexion Activé — Consultation du Cache Local Hafrose</span>
        </div>
      )}
      {children}
    </>
  );
}
