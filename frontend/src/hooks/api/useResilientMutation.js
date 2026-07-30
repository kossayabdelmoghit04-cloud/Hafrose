import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '../../services/network/useNetworkStatus';
import { offlineQueueService } from '../../services/network/offlineQueueService';
import { logger } from '../../utils/logger';

/**
 * HAFROSE — Resilient Mutation Hook with Optimistic Update & Offline Queue (Phase 9 & 6)
 * 
 * Features:
 * - Instant UI optimistic state update
 * - Offline queueing fallback when offline
 * - Snapshot state backup & automatic rollback on server error
 * - Smart cache invalidation upon completion
 */
export function useResilientMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (variables) => {
      // If client is completely offline and offline queueing is enabled for this mutation:
      if (!isOnline && options.offlineActionType) {
        logger.info('Client offline — Enqueueing mutation to offline queue', {
          type: options.offlineActionType,
          variables,
        });

        offlineQueueService.enqueue({
          type: options.offlineActionType,
          method: options.method || 'POST',
          url: options.url,
          payload: variables,
          rollbackData: options.getSnapshot ? options.getSnapshot() : null,
        });

        // Trigger optimistic update locally
        if (options.onOptimisticUpdate) {
          options.onOptimisticUpdate(variables);
        }

        return { isOfflineQueued: true };
      }

      return mutationFn(variables);
    },
    onMutate: async (variables) => {
      // 1. Cancel active refetches so they don't overwrite optimistic update
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          await queryClient.cancelQueries({ queryKey: key });
        }
      }

      // 2. Snapshot current state for rollback
      let previousSnapshot = null;
      if (options.snapshotKey) {
        previousSnapshot = queryClient.getQueryData(options.snapshotKey);
      }

      // 3. Perform optimistic cache update
      if (options.optimisticUpdater) {
        queryClient.setQueryData(options.snapshotKey, (old) =>
          options.optimisticUpdater(old, variables)
        );
      }

      if (options.onMutate) {
        await options.onMutate(variables);
      }

      return { previousSnapshot };
    },
    onError: (err, variables, context) => {
      logger.error('Resilient mutation error — Rolling back optimistic state', {
        error: err.message,
      });

      // Rollback optimistic state from snapshot
      if (options.snapshotKey && context?.previousSnapshot !== undefined) {
        queryClient.setQueryData(options.snapshotKey, context.previousSnapshot);
      }

      if (options.onError) {
        options.onError(err, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate relevant queries to fetch real server state
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }

      if (options.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
    ...options,
  });
}
