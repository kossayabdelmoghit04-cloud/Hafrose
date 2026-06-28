import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminProtectedRoute from '../components/common/AdminProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Product = lazy(() => import('../pages/Product'));
const Contact = lazy(() => import('../pages/Contact'));
const About = lazy(() => import('../pages/About'));
const Cart = lazy(() => import('../pages/Cart'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Pages d'administration
const AdminLogin = lazy(() => import('../pages/Admin/Login'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminCategories = lazy(() => import('../pages/Admin/Categories'));
const AdminProducts = lazy(() => import('../pages/Admin/Products'));
const AdminOrders = lazy(() => import('../pages/Admin/Orders'));
const AdminReviews = lazy(() => import('../pages/Admin/Reviews'));
const AdminContacts = lazy(() => import('../pages/Admin/Contacts'));
const AdminMedia = lazy(() => import('../pages/Admin/Media'));
const AdminSettings = lazy(() => import('../pages/Admin/Settings'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <MainLayout />, // Fallback to layout if rendering crashes
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
        element: <Cart />,
      },
      {
        path: 'order-confirmation',
        element: <OrderConfirmation />,
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
        ],
      },
    ],
  },
]);
