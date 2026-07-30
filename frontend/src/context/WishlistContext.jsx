import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import wishlistService from '../services/wishlistService';
import { useResilientQuery } from '../hooks/api/useResilientQuery';
import { statePersistence } from '../lib/statePersistence';
import { crossTabSync } from '../services/network/crossTabSync';
import { syncMonitor } from '../lib/syncMonitor';

const WishlistContext = createContext(null);
const WISHLIST_PERSIST_KEY = 'wishlist';

export function WishlistProvider({ children }) {
  const queryClient = useQueryClient();

  // Single Source of Truth via TanStack Query
  const { data: serverWishlist, isLoading } = useResilientQuery(
    queryKeys.wishlist.items(),
    ({ signal }) => wishlistService.getAll({ signal }),
    {
      staleTime: 1000 * 60 * 5,
      select: (res) => res?.data ?? res ?? [],
    }
  );

  // Guest fallback wishlist from versioned persistence
  const localWishlist = useMemo(
    () => statePersistence.getItem(WISHLIST_PERSIST_KEY, []),
    []
  );

  // Active wishlist data
  const wishlist = useMemo(() => {
    const list = Array.isArray(serverWishlist) && serverWishlist.length > 0 ? serverWishlist : localWishlist;
    syncMonitor.recordStateUpdate();
    return list;
  }, [serverWishlist, localWishlist]);

  // Sync guest wishlist to local storage
  const updateLocalWishlist = useCallback((newList) => {
    statePersistence.setItem(WISHLIST_PERSIST_KEY, newList);
    crossTabSync.broadcast('WISHLIST_UPDATED', { wishlist: newList });
  }, []);

  // Listen to cross-tab updates
  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((msg) => {
      if (msg.type === 'WISHLIST_UPDATED') {
        syncMonitor.recordCrossTabEvent();
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items() });
      }
    });
    return unsubscribe;
  }, [queryClient]);

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => (item.id || item.product_id) === productId),
    [wishlist]
  );

  const addToWishlist = useCallback(
    async (product) => {
      // Optimistic cache update
      queryClient.setQueryData(queryKeys.wishlist.items(), (old = []) => {
        if (old.some((i) => (i.id || i.product_id) === product.id)) return old;
        return [...old, product];
      });

      try {
        await wishlistService.add(product.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items() });
        crossTabSync.broadcast('WISHLIST_UPDATED');
      } catch (err) {
        // Guest mode fallback
        const current = statePersistence.getItem(WISHLIST_PERSIST_KEY, []);
        if (!current.some((i) => i.id === product.id)) {
          const updated = [...current, product];
          updateLocalWishlist(updated);
        }
      }
    },
    [queryClient, updateLocalWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      // Optimistic cache update
      queryClient.setQueryData(queryKeys.wishlist.items(), (old = []) =>
        old.filter((i) => (i.id || i.product_id) !== productId)
      );

      try {
        await wishlistService.remove(productId);
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items() });
        crossTabSync.broadcast('WISHLIST_UPDATED');
      } catch (err) {
        const current = statePersistence.getItem(WISHLIST_PERSIST_KEY, []);
        const updated = current.filter((i) => i.id !== productId);
        updateLocalWishlist(updated);
      }
    },
    [queryClient, updateLocalWishlist]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    queryClient.setQueryData(queryKeys.wishlist.items(), []);
    updateLocalWishlist([]);
  }, [queryClient, updateLocalWishlist]);

  const wishlistCount = wishlist.length;

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      isLoading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
    }),
    [wishlist, wishlistCount, isLoading, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist doit être utilisé dans WishlistProvider');
  }
  return context;
}
