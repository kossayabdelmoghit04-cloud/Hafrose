import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout, AccountLayout, AdminLayout, AuthLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';

// Lazy-loaded pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const ShopPage = lazy(() => import('../pages/shop/ShopPage'));
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage'));
const SearchPage = lazy(() => import('../pages/search/SearchPage'));
const WishlistPage = lazy(() => import('../pages/wishlist/WishlistPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream-100">
    <Spinner size="xl" variant="burgundy" />
  </div>
);

const router = createBrowserRouter([
  // Public routes under PublicLayout
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'shop',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ShopPage />
          </Suspense>
        ),
      },
      {
        path: 'product/:slug',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <WishlistPage />
          </Suspense>
        ),
      },
      {
        path: 'cart',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutPage />
          </Suspense>
        ),
      },
    ],
  },
  // Auth routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <div>Connexion</div> },
      { path: 'register', element: <div>Inscription</div> },
    ],
  },
  // Protected customer account routes
  {
    path: '/account',
    element: (
      <ProtectedRoute requiredRole="customer">
        <AccountLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Tableau de Bord Client</div> },
    ],
  },
  // Protected admin back-office routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Tableau de Bord Admin</div> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
