import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-luxury-cream">
        <Loader fullPage />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers l'écran de connexion si non connecté
    return <Navigate to="/admin/login" replace />;
  }

  // Si connecté, afficher la page correspondante
  return <Outlet />;
}
