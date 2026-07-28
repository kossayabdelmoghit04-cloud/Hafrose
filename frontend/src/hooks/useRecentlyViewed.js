import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hafrose_recently_viewed';
const MAX_ITEMS = 8;

export default function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Unable to access localStorage for recently viewed products:', e);
    }
  }, []);

  // Add product to recently viewed list
  const trackView = useCallback((product) => {
    if (!product || !product.id) return;

    setRecentlyViewed((prev) => {
      // Filter out duplicate
      const filtered = prev.filter((item) => item.id !== product.id);
      // Prepend current product
      const updated = [
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image || product.primary_image || (product.images && product.images[0]),
          material: product.material,
          category: product.category?.name || product.category_name,
          viewedAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Unable to save recently viewed product to localStorage:', e);
      }

      return updated;
    });
  }, []);

  // Clear list
  const clearHistory = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear recently viewed storage:', e);
    }
  }, []);

  return {
    recentlyViewed,
    trackView,
    clearHistory,
  };
}
