import { useQuery } from '@tanstack/react-query';
import { wishlistService } from '../../../services/wishlist.service';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { useEffect } from 'react';

export const WISHLIST_QUERY_KEY = ['wishlist'] as const;

/**
 * useWishlist
 * Fetches the customer wishlist from the API and syncs it with the local Zustand store.
 * Only active when the user is authenticated.
 */
export function useWishlist(enabled = true) {
  const { setItems } = useWishlistStore();

  const query = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistService.getWishlist(),
    enabled,
  });

  useEffect(() => {
    if (query.data?.data) {
      setItems(query.data.data);
    }
  }, [query.data, setItems]);

  return query;
}
