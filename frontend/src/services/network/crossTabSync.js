import { logger } from '../../utils/logger';

/**
 * HAFROSE — Cross-Tab Synchronization Engine (Phase 6)
 * 
 * Synchronizes state changes across open browser tabs in real-time:
 * - Uses BroadcastChannel API with window 'storage' event fallback.
 * - Broadcasts: WISHLIST_UPDATED, CART_UPDATED, AUTH_LOGIN, AUTH_LOGOUT, CURRENCY_CHANGED, LANG_CHANGED.
 */

const CHANNEL_NAME = 'hafrose_cross_tab_sync';

class CrossTabSyncEngine {
  constructor() {
    this.channel = null;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event) => this.handleMessage(event.data);
        } catch (e) {
          logger.warn('BroadcastChannel failed to initialize, using storage fallback', { error: e.message });
        }
      }

      // Storage event listener fallback
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('hafrose_')) {
          this.handleMessage({
            type: 'STORAGE_EVENT',
            key: event.key,
            newValue: event.newValue,
            oldValue: event.oldValue,
            timestamp: Date.now(),
          });
        }
      });
    }
  }

  /**
   * Broadcasts a state synchronization event to all other tabs
   */
  broadcast(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      senderId: window.__hafrose_tab_id || (window.__hafrose_tab_id = Math.random().toString(36).substring(2, 9)),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        logger.error('Failed to post BroadcastChannel message', { error: e.message });
      }
    }
  }

  /**
   * Processes incoming sync messages from other tabs
   */
  handleMessage(message) {
    if (!message || message.senderId === window.__hafrose_tab_id) return;

    logger.info(`[Cross-Tab Sync 🔄] Received event: ${message.type}`, message);
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (e) {
        logger.error('Error in cross-tab listener callback', { error: e.message });
      }
    });
  }

  /**
   * Subscribes to cross-tab messages
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const crossTabSync = new CrossTabSyncEngine();
