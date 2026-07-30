import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';

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

  const addToWishlist = useCallback(async (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
    try {
      await wishlistService.add(product.id);
    } catch {
      // Swallowed silently: guest mode fallback to localStorage
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    try {
      await wishlistService.remove(productId);
    } catch {
      // Swallowed silently: guest mode fallback to localStorage
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    const isPresent = wishlist.some((item) => item.id === product.id);
    setWishlist((prev) => {
      if (isPresent) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
    try {
      if (isPresent) {
        await wishlistService.remove(product.id);
      } else {
        await wishlistService.add(product.id);
      }
    } catch {
      // Swallowed silently: guest mode fallback to localStorage
    }
  }, [wishlist]);

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
