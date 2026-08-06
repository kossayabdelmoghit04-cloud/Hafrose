import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../pages/home/sections/AnnouncementBar';
import { Header } from '../pages/home/sections/Header';
import { Footer } from '../pages/home/sections/Footer';
import { Drawer } from '../components/ui/Drawer';
import { SearchInput } from '../components/ui/SearchInput';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';

/**
 * Public Layout Shell
 * Single source of truth for:
 * - AnnouncementBar (permanent top banner)
 * - Header with sticky navigation
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
      {/* Permanent Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Header with dynamic cart/wishlist badge counts */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onSearchOpen={() => setIsSearchOpen(true)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Main Page Content Outlet */}
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Search Overlay Drawer */}
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

      {/* Global Quick-Cart Drawer */}
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
