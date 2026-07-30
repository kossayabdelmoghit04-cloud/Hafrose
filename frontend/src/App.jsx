import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { NetworkProvider } from './services/network/useNetworkStatus';
import { APIErrorBoundary } from './components/common/network/APIErrorBoundary';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <APIErrorBoundary>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    <RouterProvider router={router} />
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </APIErrorBoundary>
      </NetworkProvider>
    </QueryClientProvider>
  );
}

export default App;
