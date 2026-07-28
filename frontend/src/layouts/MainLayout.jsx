import { useEffect, useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import Footer from '../components/common/Footer';
import Loader from '../components/ui/Loader';

// Helper : scroll en haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function MainLayout() {
  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    try {
      return sessionStorage.getItem('hafrose_announcement_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  return (
    <div
      className="flex flex-col min-h-screen bg-off-white text-anthracite selection:bg-rose-gold/20 selection:text-anthracite"
    >
      <ScrollToTop />

      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Header principal */}
      <Navbar announcementVisible={announcementVisible} />

      {/* Contenu principal — padding-bottom sur mobile pour la MobileBottomNav */}
      <main className="main-content flex-grow pb-16 md:pb-0" id="main-content" tabIndex={-1}>
        <Suspense fallback={<Loader fullPage />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (Mobile uniquement) */}
      <MobileBottomNav />
    </div>
  );
}
