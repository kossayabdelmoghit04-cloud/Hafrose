import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Création du client React Query avec des configurations par défaut adaptées
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Évite les rafraîchissements intempestifs en changeant d'onglet
      retry: 1, // Limite le nombre d'essais en cas d'erreur
      staleTime: 1000 * 60 * 5, // Les données sont considérées fraîches pendant 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
