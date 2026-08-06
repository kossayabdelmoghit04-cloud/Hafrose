import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { RoleType } from '../types/models';
import { ROUTES } from '../constants/routes.constants';

interface ProtectedRouteProps {
  requiredRole?: RoleType;
}

/**
 * Route Navigation Guard Architecture
 * Controls access to Customer Account and Admin Panel based on Sanctum Auth state and user roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="p-8 text-center">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'super_admin') {
    return <Navigate to={ROUTES.PUBLIC.HOME} replace />;
  }

  return <Outlet />;
};
