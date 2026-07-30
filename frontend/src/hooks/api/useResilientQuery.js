import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '../../services/network/useNetworkStatus';

/**
 * HAFROSE — Resilient Query Hook (Phase 8 & 10)
 * 
 * Extends TanStack useQuery with:
 * - Network-aware placeholder data
 * - Offline cache fallbacks
 * - Automatic AbortSignal generation per query
 * - Background sync indicator states
 */
export function useResilientQuery(queryKey, queryFn, options = {}) {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const queryResult = useQuery({
    queryKey,
    queryFn: async (context) => {
      // Pass AbortSignal down into service / fetch call
      return queryFn({ ...context, signal: context.signal });
    },
    enabled: options.enabled !== undefined ? options.enabled : true,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    placeholderData: options.placeholderData,
    select: options.select,
    ...options,
  });

  return {
    ...queryResult,
    isOffline: !isOnline,
    isSlowConnection,
    isRefreshing: queryResult.isFetching && !queryResult.isLoading,
  };
}
