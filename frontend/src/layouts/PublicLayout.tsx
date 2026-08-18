import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { AnnouncementBar } from '../pages/home/sections/AnnouncementBar';
import { Header } from '../pages/home/sections/Header';
import { Footer } from '../pages/home/sections/Footer';
import { Drawer } from '../components/ui/Drawer';
import { SearchInput } from '../components/ui/SearchInput';
import { GlobalErrorBoundary } from '../components/ui/ErrorBoundary';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { formatPrice, getImageUrl } from '../utils/formatters';

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
  const [searchQuery, setSearchQuery] = useState('');

  const { items: cartItems, updateQuantity, removeItem, isDrawerOpen, setDrawerOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleGoToCart = () => {
    setDrawerOpen(false);
    navigate('/cart');
  };

  const handleGoToCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

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
        onCartOpen={() => setDrawerOpen(true)}
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
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        title="Votre Panier HAFROSE"
      >
        {cartItems.length === 0 ? (
          /* ── État panier vide ── */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-serif text-h5 text-neutral-800">Votre panier est vide</p>
            <p className="text-body-sm text-neutral-500 leading-relaxed">
              Découvrez nos collections et trouvez votre prochaine pièce HAFROSE.
            </p>
            <button
              type="button"
              onClick={() => { setDrawerOpen(false); navigate('/shop'); }}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-500 text-white text-body-sm font-medium rounded-xs hover:bg-burgundy-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500"
            >
              Découvrir la boutique
            </button>
          </div>
        ) : (
          /* ── Articles du panier ── */
          <div className="flex flex-col h-full">

            {/* Liste des articles — scrollable */}
            <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-neutral-100">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 py-4 px-1">

                  {/* Miniature produit */}
                  <div className="w-16 h-20 flex-shrink-0 rounded-xs bg-cream-200 overflow-hidden border border-neutral-100">
                    <img
                      src={getImageUrl(item.product.image ?? item.product.media?.[0]?.url ?? null)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-sans text-body-sm font-medium text-neutral-900 leading-snug line-clamp-2">
                          {item.product.name}
                        </p>
                        {(item.selected_size || item.selected_color) && (
                          <p className="text-caption text-neutral-400 mt-0.5">
                            {[item.selected_size, item.selected_color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Supprimer ${item.product.name}`}
                        className="flex-shrink-0 p-1 text-neutral-300 hover:text-error-500 transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-error-400 rounded-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Prix + Quantité */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Contrôles quantité */}
                      <div className="flex items-center gap-0 border border-neutral-200 rounded-xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Diminuer la quantité"
                          className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-body-sm font-medium text-neutral-900 bg-white border-x border-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          aria-label="Augmenter la quantité"
                          className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Sous-total ligne */}
                      <span className="font-sans text-body-sm font-semibold text-neutral-900">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pied du drawer : total + boutons */}
            <div className="border-t border-neutral-200 pt-4 mt-2 space-y-3 flex-shrink-0">
              <div className="flex items-baseline justify-between">
                <span className="text-body-sm text-neutral-600">Sous-total</span>
                <span className="font-sans font-semibold text-body-base text-neutral-950">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <p className="text-caption text-neutral-400">
                Livraison et taxes calculées à la commande.
              </p>

              {/* Bouton Voir le panier */}
              <button
                type="button"
                onClick={handleGoToCart}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-300 rounded-xs text-body-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                Voir mon panier
              </button>

              {/* Bouton Commander */}
              <button
                type="button"
                onClick={handleGoToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-burgundy-500 text-white rounded-xs text-body-sm font-semibold hover:bg-burgundy-600 active:bg-burgundy-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 shadow-hafrose-xs"
              >
                <span>Commander</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
