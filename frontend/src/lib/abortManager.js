/**
 * HAFROSE — Global AbortController Manager (Phase 2)
 * 
 * Provides centralized lifecycle management for network requests:
 * - Scoped controllers by request key or route.
 * - Automatic cancellation on page change, unmount, or tab switch.
 * - Prevents zombie network requests from lingering in memory.
 */

class AbortManager {
  constructor() {
    this.controllers = new Map();
  }

  /**
   * Creates or retrieves a signal for a key. If an existing key request is pending, it aborts it first.
   */
  createSignal(key) {
    if (this.controllers.has(key)) {
      this.abort(key, 'Superceded by newer request');
    }
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller.signal;
  }

  /**
   * Aborts request for a specific key
   */
  abort(key, reason = 'Request cancelled') {
    const controller = this.controllers.get(key);
    if (controller) {
      try {
        controller.abort(reason);
      } catch (e) {
        // Ignore duplicate abort errors
      }
      this.controllers.delete(key);
    }
  }

  /**
   * Cleans up signal key after completion
   */
  remove(key) {
    this.controllers.delete(key);
  }

  /**
   * Aborts all active network requests across the application
   */
  abortAll(reason = 'Global route change / reset') {
    for (const [key, controller] of this.controllers.entries()) {
      try {
        controller.abort(reason);
      } catch (e) {
        // Ignore
      }
    }
    this.controllers.clear();
  }
}

export const abortManager = new AbortManager();
