import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { RoleType } from '../types/models';
import { ROUTES } from '../constants/routes.constants';
import { Spinner } from '../components/ui/Spinner';

interface ProtectedRouteProps {
  requiredRole?: RoleType;
  children?: React.ReactNode;
}

/**
 * Route Navigation Guard Architecture
 * Controls access to Customer Account and Admin Panel based on Sanctum Auth state and user roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'super_admin') {
    return <Navigate to={ROUTES.PUBLIC.HOME} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
