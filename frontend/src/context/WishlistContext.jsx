import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'hafrose_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erreur chargement wishlist localStorage:', e);
      return [];
    }
  });

  // Synchroniser avec localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Erreur sauvegarde wishlist localStorage:', e);
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const addToWishlist = useCallback((product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist doit être utilisé dans WishlistProvider');
  }
  return context;
}
