import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryKeys } from '../../queryKeys';
import { statePersistence } from '../../lib/statePersistence';
import { crossTabSync } from '../../services/network/crossTabSync';
import { syncMonitor } from '../../lib/syncMonitor';

describe('HAFROSE Enterprise State Synchronization Suite (Phase 16)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Phase 3: Centralized Enterprise Query Keys', () => {
    it('generates non-overlapping typed query keys across domain entities', () => {
      expect(queryKeys.products.all).toEqual(['products']);
      expect(queryKeys.products.list({ category: 'sacs' })).toEqual(['products', 'list', { category: 'sacs' }]);
      expect(queryKeys.cart.items()).toEqual(['cart', 'items']);
      expect(queryKeys.wishlist.items()).toEqual(['wishlist', 'items']);
      expect(queryKeys.profile.me()).toEqual(['profile', 'me']);
    });
  });

  describe('Phase 4 & 9: Versioned State Persistence Engine', () => {
    it('persists and retrieves schema versioned data', () => {
      statePersistence.setItem('test_cart', [{ id: 1, name: 'Sac Hafrose' }]);
      const retrieved = statePersistence.getItem('test_cart');

      expect(retrieved).toEqual([{ id: 1, name: 'Sac Hafrose' }]);
    });

    it('clears expired TTL persisted state automatically', () => {
      // Set expired item with negative TTL (-1000ms)
      statePersistence.setItem('expired_session', 'token123', -1000);
      const retrieved = statePersistence.getItem('expired_session', null);

      expect(retrieved).toBeNull();
    });

    it('recovers gracefully from corrupted JSON in localStorage', () => {
      localStorage.setItem('hafrose_v1_corrupted', '{ invalid json ...');
      const retrieved = statePersistence.getItem('corrupted', 'default_fallback');

      expect(retrieved).toBe('default_fallback');
    });
  });

  describe('Phase 6: Cross-Tab Synchronization Engine', () => {
    it('broadcasts and receives state sync messages across tabs', () => {
      const listener = vi.fn();
      const unsubscribe = crossTabSync.subscribe(listener);

      // Simulate incoming message
      crossTabSync.handleMessage({
        type: 'WISHLIST_UPDATED',
        payload: { count: 2 },
        senderId: 'other_tab_123',
      });

      expect(listener).toHaveBeenCalledWith({
        type: 'WISHLIST_UPDATED',
        payload: { count: 2 },
        senderId: 'other_tab_123',
      });

      unsubscribe();
    });
  });

  describe('Phase 14: Synchronization Monitoring Engine', () => {
    it('tracks cache hits, misses, and cross-tab events correctly', () => {
      syncMonitor.recordCacheHit();
      syncMonitor.recordCacheHit();
      syncMonitor.recordCacheMiss();
      syncMonitor.recordCrossTabEvent();

      const metrics = syncMonitor.getMetrics();
      expect(metrics.cacheHits).toBeGreaterThanOrEqual(2);
      expect(metrics.cacheMisses).toBeGreaterThanOrEqual(1);
      expect(metrics.crossTabEvents).toBeGreaterThanOrEqual(1);
      expect(metrics.hitRatio).toBeGreaterThan(0);
    });
  });
});
