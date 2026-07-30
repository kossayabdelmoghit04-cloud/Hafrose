import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestDeduplicator } from '../../lib/requestDeduplicator';
import { abortManager } from '../../lib/abortManager';
import { sequenceTracker } from '../../lib/sequenceTracker';
import { offlineQueueService } from '../../services/network/offlineQueueService';
import { sanitizeData } from '../../utils/logger';

describe('HAFROSE Enterprise Network Reliability Suite (Phase 19)', () => {
  beforeEach(() => {
    requestDeduplicator.clear();
    abortManager.abortAll();
    sequenceTracker.reset();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Phase 3: Request Deduplication', () => {
    it('coalesces 5 identical concurrent GET requests into 1 execution', async () => {
      const mockFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: 'success' }), 50))
      );

      const key = requestDeduplicator.generateKey({ method: 'get', url: '/products', params: { page: 1 } });

      const p1 = requestDeduplicator.dedupe(key, mockFn);
      const p2 = requestDeduplicator.dedupe(key, mockFn);
      const p3 = requestDeduplicator.dedupe(key, mockFn);
      const p4 = requestDeduplicator.dedupe(key, mockFn);
      const p5 = requestDeduplicator.dedupe(key, mockFn);

      const results = await Promise.all([p1, p2, p3, p4, p5]);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(results[0]).toEqual({ data: 'success' });
      expect(results[4]).toEqual({ data: 'success' });
    });
  });

  describe('Phase 2: AbortController Lifecycle', () => {
    it('creates and aborts signal properly for key', () => {
      const signal = abortManager.createSignal('search_key');
      expect(signal.aborted).toBe(false);

      abortManager.abort('search_key', 'User navigated');
      expect(signal.aborted).toBe(true);
    });

    it('cancels pending signal when new signal with same key is created', () => {
      const signal1 = abortManager.createSignal('page_products');
      expect(signal1.aborted).toBe(false);

      const signal2 = abortManager.createSignal('page_products');
      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(false);
    });
  });

  describe('Phase 4: Race Condition Sequence Tracker', () => {
    it('tracks sequential transaction IDs and invalidates stale responses', () => {
      const seq1 = sequenceTracker.nextSequence('search_input');
      const seq2 = sequenceTracker.nextSequence('search_input');

      expect(seq1).toBe(1);
      expect(seq2).toBe(2);

      // seq1 is now stale
      expect(sequenceTracker.isCurrent('search_input', seq1)).toBe(false);
      expect(sequenceTracker.isCurrent('search_input', seq2)).toBe(true);
    });
  });

  describe('Phase 6: Offline Queue & Local Storage Persistence', () => {
    it('enqueues mutations offline and stores in localStorage', () => {
      const item = offlineQueueService.enqueue({
        type: 'TOGGLE_WISHLIST',
        method: 'POST',
        url: '/wishlist',
        payload: { product_id: 42 },
      });

      const queue = offlineQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].id).toBe(item.id);
      expect(queue[0].payload).toEqual({ product_id: 42 });
    });
  });

  describe('Phase 15 & 17: Security Sanitizer', () => {
    it('sanitizes tokens, authorization headers, and passwords', () => {
      const dirty = {
        password: 'SuperSecret123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        user: {
          name: 'Maison Hafrose Client',
          email: 'client@hafrose.com',
          credit_card: '4532111122223333',
        },
      };

      const clean = sanitizeData(dirty);

      expect(clean.password).toBe('[REDACTED]');
      expect(clean.token).toBe('[REDACTED]');
      expect(clean.authorization).toBe('[REDACTED]');
      expect(clean.user.credit_card).toBe('[REDACTED]');
      expect(clean.user.email).toBe('client@hafrose.com');
    });
  });
});
