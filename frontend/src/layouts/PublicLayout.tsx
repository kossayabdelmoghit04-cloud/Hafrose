import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../pages/home/sections/AnnouncementBar';
import { Header } from '../pages/home/sections/Header';
import { Footer } from '../pages/home/sections/Footer';
import { Drawer } from '../components/ui/Drawer';
import { SearchInput } from '../components/ui/SearchInput';
import { GlobalErrorBoundary } from '../components/ui/ErrorBoundary';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';

/**
 * Public Layout Shell
 * Single source of truth for:
 * - AnnouncementBar (permanent top banner)
 * - Header with sticky navigation
 * - Skip-to-content link (WCAG 2.2 AA — 2.4.1)
 * - Global Error Boundary wrapping the page content
 * - Global search drawer overlay
 * - Global quick-cart drawer overlay
 * - Footer
 * All public pages rendered via <Outlet /> automatically inherit these.
 */
export const PublicLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-neutral-900 font-sans">

      {/* ── Skip-to-Content (WCAG 2.4.1) ────────────────────────── */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
          'focus:px-4 focus:py-2 focus:rounded-sm',
          'focus:bg-burgundy-500 focus:text-white focus:font-sans focus:text-body-sm focus:font-medium',
          'focus:shadow-hafrose-hover focus:outline-none',
          'transition-all duration-200',
        ].join(' ')}
      >
        Passer au contenu principal
      </a>

      {/* ── Permanent Announcement Bar ────────────────────────────── */}
      <AnnouncementBar />

      {/* ── Sticky Header ────────────────────────────────────────── */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onSearchOpen={() => setIsSearchOpen(true)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* ── Main Page Content — Error-Bounded ────────────────────── */}
      <main
        id="main-content"
        className="flex-grow"
        tabIndex={-1}
        aria-label="Contenu principal"
      >
        <GlobalErrorBoundary>
          <Outlet />
        </GlobalErrorBoundary>
      </main>

      {/* ── Global Footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ── Global Search Overlay Drawer ──────────────────────────── */}
      <Drawer
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); setSearchQuery(''); }}
        position="top"
        title="Rechercher sur HAFROSE"
      >
        <div className="p-4 max-w-xl mx-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Rechercher une robe, un sac, une couleur..."
            autoFocus
          />
        </div>
      </Drawer>

      {/* ── Global Quick-Cart Drawer ──────────────────────────────── */}
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        position="right"
        title="Votre Panier HAFROSE"
      >
        <div className="space-y-4">
          {cartCount === 0 ? (
            <p className="text-body-sm text-neutral-500 text-center py-8">
              Votre panier est vide.
            </p>
          ) : (
            <p className="text-body-sm text-neutral-600">
              Vous avez <strong>{cartCount}</strong> article{cartCount > 1 ? 's' : ''} dans votre panier.
            </p>
          )}
        </div>
      </Drawer>
    </div>
  );
};
