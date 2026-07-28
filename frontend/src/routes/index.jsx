import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminProtectedRoute from '../components/common/AdminProtectedRoute';
import CustomerProtectedRoute from '../components/common/CustomerProtectedRoute';
import AccountLayout from '../pages/Account/AccountLayout';

// Public pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Product = lazy(() => import('../pages/Product'));
const Contact = lazy(() => import('../pages/Contact'));
const About = lazy(() => import('../pages/About'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Customer Auth pages
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));

// Customer Account pages
const AccountDashboard = lazy(() => import('../pages/Account/Dashboard'));
const AccountOrders = lazy(() => import('../pages/Account/Orders'));
const AccountOrderDetail = lazy(() => import('../pages/Account/OrderDetail'));
const AccountOrderTracking = lazy(() => import('../pages/Account/OrderTracking'));
const AccountAddresses = lazy(() => import('../pages/Account/Addresses'));
const AccountProfile = lazy(() => import('../pages/Account/Profile'));
const AccountNotifications = lazy(() => import('../pages/Account/Notifications'));
const AccountWishlist = lazy(() => import('../pages/Account/Wishlist'));

// v2.0 Portal pages
const LoyaltyDashboard = lazy(() => import('../pages/Portal/LoyaltyDashboard'));

// Admin pages
const AdminLogin = lazy(() => import('../pages/Admin/Login'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminCategories = lazy(() => import('../pages/Admin/Categories'));
const AdminProducts = lazy(() => import('../pages/Admin/Products'));
const AdminOrders = lazy(() => import('../pages/Admin/Orders'));
const AdminReviews = lazy(() => import('../pages/Admin/Reviews'));
const AdminContacts = lazy(() => import('../pages/Admin/Contacts'));
const AdminMedia = lazy(() => import('../pages/Admin/Media'));
const AdminSettings = lazy(() => import('../pages/Admin/Settings'));
const BusinessAnalyticsDashboard = lazy(() => import('../pages/Admin/BusinessAnalyticsDashboard'));


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop',
        element: <Shop />,
      },
      {
        path: 'product/:slug',
        element: <Product />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'order-confirmation',
        element: <OrderConfirmation />,
      },

      // v2.0 Public Portal Routes
      {
        path: 'loyalty',
        element: <LoyaltyDashboard />,
      },

      // Auth Routes
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },

      // Protected Customer Account Routes
      {
        path: 'account',
        element: <CustomerProtectedRoute />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              {
                path: 'dashboard',
                element: <AccountDashboard />,
              },
              {
                path: 'orders',
                element: <AccountOrders />,
              },
              {
                path: 'orders/:id',
                element: <AccountOrderDetail />,
              },
              {
                path: 'orders/tracking/:id',
                element: <AccountOrderTracking />,
              },
              {
                path: 'addresses',
                element: <AccountAddresses />,
              },
              {
                path: 'profile',
                element: <AccountProfile />,
              },
              {
                path: 'notifications',
                element: <AccountNotifications />,
              },
              {
                path: 'wishlist',
                element: <AccountWishlist />,
              },
            ],
          },
        ],
      },

      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'categories',
            element: <AdminCategories />,
          },
          {
            path: 'products',
            element: <AdminProducts />,
          },
          {
            path: 'orders',
            element: <AdminOrders />,
          },
          {
            path: 'reviews',
            element: <AdminReviews />,
          },
          {
            path: 'contacts',
            element: <AdminContacts />,
          },
          {
            path: 'media',
            element: <AdminMedia />,
          },
          {
            path: 'settings',
            element: <AdminSettings />,
          },
          {
            path: 'analytics',
            element: <BusinessAnalyticsDashboard />,
          },
        ],
      },
    ],
  },
]);
