import { useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/ui/Loader';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-luxury-cream text-luxury-charcoal selection:bg-luxury-gold/25 selection:text-luxury-charcoal">
      {/* Reset view scroll when route changes */}
      <ScrollToTop />

      {/* Global Luxury Header */}
      <Navbar />

      {/* Main content slot */}
      <main className="flex-grow">
        <Suspense fallback={<Loader fullPage />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
