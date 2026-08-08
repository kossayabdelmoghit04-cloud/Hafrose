import React, { ReactNode, useEffect } from 'react';
import { QueryProvider } from './QueryProvider';
import { GlobalErrorBoundary } from '../components/ui/ErrorBoundary';
import { useAuthStore } from '../stores/useAuthStore';
import { useSession } from '../hooks/useSession';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Inner component so useSession can access QueryClient (provided by QueryProvider above it).
 * Also listens for global 401 events dispatched by apiClient.
 */
const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logout } = useAuthStore();
  useSession(); // Rehydrate auth session from stored token on every page load

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('hafrose:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('hafrose:unauthorized', handleUnauthorized);
  }, [logout]);

  return <>{children}</>;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {

  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <AppInitializer>{children}</AppInitializer>
      </QueryProvider>
    </GlobalErrorBoundary>
  );
};
