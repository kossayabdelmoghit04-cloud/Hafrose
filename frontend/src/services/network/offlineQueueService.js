import api from '../api';
import { logger } from '../../utils/logger';

/**
 * HAFROSE — Offline Mutation Queue & Sync Engine (Phase 6)
 * 
 * Stores non-blocking mutations (Wishlist, Addresses, Profile, Reviews, Notifications)
 * while offline in localStorage / IndexedDB, and automatically replays them FIFO when back online.
 */

const STORAGE_KEY = 'hafrose_offline_queue_v1';

class OfflineQueueService {
  constructor() {
    this.isProcessing = false;
    this.listeners = new Set();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  getQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      logger.error('Failed to read offline queue from storage', { error: e.message });
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners(queue);
    } catch (e) {
      logger.error('Failed to save offline queue to storage', { error: e.message });
    }
  }

  /**
   * Enqueues a mutation payload to be replayed upon reconnection
   */
  enqueue(action) {
    const queue = this.getQueue();
    const item = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type: action.type, // e.g. 'TOGGLE_WISHLIST', 'UPDATE_ADDRESS', 'SUBMIT_REVIEW'
      method: (action.method || 'POST').toLowerCase(),
      url: action.url,
      payload: action.payload,
      rollbackData: action.rollbackData,
    };
    queue.push(item);
    this.saveQueue(queue);
    logger.info('Queued offline mutation action', item);

    // If online, try processing immediately
    if (navigator.onLine) {
      this.processQueue();
    }
    return item;
  }

  /**
   * Processes all queued offline mutations FIFO
   */
  async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isProcessing = true;
    logger.info(`Starting playback of ${queue.length} offline mutations...`);

    const remainingQueue = [...queue];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        logger.info(`Replaying offline mutation [${item.type}] to ${item.url}`);
        const method = (item.method || 'post').toLowerCase();
        if (typeof api[method] === 'function') {
          await api[method](item.url, item.payload);
        } else {
          await api.post(item.url, item.payload);
        }
        // Success: remove from queue
        remainingQueue.shift();
        this.saveQueue(remainingQueue);
      } catch (err) {
        logger.error(`Offline mutation replay failed for item ${item.id}`, { error: err.message });
        // If error is 4xx client validation, pop it to avoid deadlocking queue
        if (err.status >= 400 && err.status < 500) {
          remainingQueue.shift();
          this.saveQueue(remainingQueue);
          if (item.onRollback) {
            try {
              item.onRollback(item.rollbackData);
            } catch (e) {
              // Ignore
            }
          }
        } else {
          // Server still down: halt queue replay until next online event
          break;
        }
      }
    }

    this.isProcessing = false;
    logger.info('Offline mutation queue processing finished.');
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(queue) {
    this.listeners.forEach((fn) => fn(queue));
  }
}

export const offlineQueueService = new OfflineQueueService();
