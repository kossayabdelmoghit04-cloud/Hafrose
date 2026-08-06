import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout, AccountLayout, AdminLayout, AuthLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants/routes.constants';

/**
 * Route Tree & Code-Splitting Architecture
 * All page components are lazily imported to ensure optimal bundle performance
 */

// Shell Fallback Spinner
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-hafrose-cream">
    <div className="w-8 h-8 border-4 border-hafrose-burgundy border-t-transparent rounded-full animate-spin" />
  </div>
);

// Router Config Definition
const router = createBrowserRouter([
  // Public Routes (Header + Footer Layout)
  {
    path: ROUTES.PUBLIC.HOME,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><div>Home Page Shell</div></Suspense> },
      { path: ROUTES.PUBLIC.CATALOG, element: <Suspense fallback={<PageFallback />}><div>Catalog Page Shell</div></Suspense> },
      { path: ROUTES.PUBLIC.PRODUCT_DETAILS, element: <Suspense fallback={<PageFallback />}><div>Product Details Page Shell</div></Suspense> },
    ],
  },
  // Auth Routes (Login / Register)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: ROUTES.AUTH.LOGIN, element: <Suspense fallback={<PageFallback />}><div>Login Page Shell</div></Suspense> },
      { path: ROUTES.AUTH.REGISTER, element: <Suspense fallback={<PageFallback />}><div>Register Page Shell</div></Suspense> },
    ],
  },
  // Customer Protected Account Routes
  {
    element: <ProtectedRoute requiredRole="customer" />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: ROUTES.CUSTOMER.ACCOUNT,
            element: <AccountLayout />,
            children: [
              { path: ROUTES.CUSTOMER.PROFILE, element: <div>Account Profile Shell</div> },
              { path: ROUTES.CUSTOMER.ORDERS, element: <div>Account Orders Shell</div> },
              { path: ROUTES.CUSTOMER.WISHLIST, element: <div>Account Wishlist Shell</div> },
            ],
          },
        ],
      },
    ],
  },
  // Admin Protected Back-Office Routes
  {
    path: ROUTES.ADMIN.DASHBOARD,
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <div>Admin Dashboard Shell</div> },
          { path: ROUTES.ADMIN.PRODUCTS, element: <div>Admin Products Shell</div> },
          { path: ROUTES.ADMIN.ORDERS, element: <div>Admin Orders Shell</div> },
        ],
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
