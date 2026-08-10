import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout, AccountLayout, AdminLayout, AuthLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';

// Lazy-loaded Public pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const ShopPage = lazy(() => import('../pages/shop/ShopPage'));
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage'));
const SearchPage = lazy(() => import('../pages/search/SearchPage'));
const WishlistPage = lazy(() => import('../pages/wishlist/WishlistPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));

// Lazy-loaded Auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const AdminContactsPage = lazy(() => import('../pages/admin/AdminContactsPage'));
const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage'));
const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminLogsPage = lazy(() => import('../pages/admin/AdminLogsPage'));

// Lazy-loaded Customer Account pages
const DashboardPage = lazy(() => import('../pages/account/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('../pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/account/OrderDetailPage'));
const AddressesPage = lazy(() => import('../pages/account/AddressesPage'));
const AccountWishlistPage = lazy(() => import('../pages/account/AccountWishlistPage'));

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
  // Auth routes under AuthLayout
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
    ],
  },
  // Protected customer account routes under AccountLayout
  {
    path: '/account',
    element: (
      <ProtectedRoute requiredRole="customer">
        <AccountLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OrderDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'addresses',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AddressesPage />
          </Suspense>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AccountWishlistPage />
          </Suspense>
        ),
      },
    ],
  },
  // ── PUBLIC Admin Login (no auth required) ───────────────────────
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  // ── PROTECTED Admin Back-Office ─────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminCategoriesPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminOrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'reviews',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminReviewsPage />
          </Suspense>
        ),
      },
      {
        path: 'contacts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminContactsPage />
          </Suspense>
        ),
      },
      {
        path: 'media',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminMediaPage />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminSettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'logs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminLogsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
