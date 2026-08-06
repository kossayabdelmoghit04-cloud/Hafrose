import React, { ReactNode, useEffect } from 'react';
import { QueryProvider } from './QueryProvider';
import { useAuthStore } from '../stores/useAuthStore';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Main Application Provider Wrapper
 * Encapsulates global state providers and initializes session listeners
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Listen to global 401 unauthorized events emitted by apiClient
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('hafrose:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('hafrose:unauthorized', handleUnauthorized);
  }, [logout]);

  return <QueryProvider>{children}</QueryProvider>;
};
