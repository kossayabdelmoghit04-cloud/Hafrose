import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../../../services/wishlist.service';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { WISHLIST_QUERY_KEY } from './useWishlist';

/**
 * useToggleWishlist
 * Adds or removes a product from the wishlist with optimistic store update.
 * Invalidates the wishlist cache on completion for server-side consistency.
 */
export function useToggleWishlist() {
  const { isWishlisted, removeItem, addItem } = useWishlistStore();
  const queryClient = useQueryClient();

  const toggle = useCallback(
    async (productId: number) => {
      if (isWishlisted(productId)) {
        removeItem(productId); // Optimistic local update
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId).then((res) => {
          addItem(res.data);
        });
      }
      await queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
    [isWishlisted, removeItem, addItem, queryClient]
  );

  return { toggle, isWishlisted };
}
