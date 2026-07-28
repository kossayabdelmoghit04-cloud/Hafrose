import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerProtectedRoute() {
  const { isCustomerAuthenticated } = useAuth();
  const location = useLocation();

  if (!isCustomerAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
