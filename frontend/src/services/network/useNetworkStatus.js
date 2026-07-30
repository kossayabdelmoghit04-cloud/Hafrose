import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * HAFROSE — Enterprise Network Status Context & Hook (Phase 5)
 * 
 * Tracks:
 * - Online / Offline status
 * - Effective Connection Type ('4g', '3g', '2g', 'slow-2g')
 * - Latency & Connection Speed
 * - Reconnection events
 */

const NetworkContext = createContext({
  isOnline: true,
  effectiveType: '4g',
  isSlowConnection: false,
  lastReconnectAt: null,
});

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [effectiveType, setEffectiveType] = useState('4g');
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [lastReconnectAt, setLastReconnectAt] = useState(null);

  useEffect(() => {
    const updateNetworkDetails = () => {
      const online = navigator.onLine;
      setIsOnline((prev) => {
        if (!prev && online) {
          setLastReconnectAt(Date.now());
        }
        return online;
      });

      if ('connection' in navigator && navigator.connection) {
        const conn = navigator.connection;
        const type = conn.effectiveType || '4g';
        setEffectiveType(type);
        setIsSlowConnection(type === '2g' || type === 'slow-2g' || conn.rtt > 1000);
      }
    };

    updateNetworkDetails();

    window.addEventListener('online', updateNetworkDetails);
    window.addEventListener('offline', updateNetworkDetails);

    if ('connection' in navigator && navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkDetails);
    }

    return () => {
      window.removeEventListener('online', updateNetworkDetails);
      window.removeEventListener('offline', updateNetworkDetails);
      if ('connection' in navigator && navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkDetails);
      }
    };
  }, []);

  return React.createElement(
    NetworkContext.Provider,
    {
      value: {
        isOnline,
        effectiveType,
        isSlowConnection,
        lastReconnectAt,
      },
    },
    children
  );
}

export function useNetworkStatus() {
  return useContext(NetworkContext);
}
