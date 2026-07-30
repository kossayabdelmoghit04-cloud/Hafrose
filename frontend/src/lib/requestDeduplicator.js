/**
 * HAFROSE — Request Deduplicator (Phase 3)
 * 
 * Prevents identical concurrent network requests:
 * - When 5 components request GET /products simultaneously, only 1 HTTP request is dispatched.
 * - All components share the exact same Promise response.
 */

class RequestDeduplicator {
  constructor() {
    this.inFlightRequests = new Map();
  }

  /**
   * Generates a unique key for an Axios config object
   */
  generateKey(config) {
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${method}:${url}:${params}`;
  }

  /**
   * Executes or shares a promise for identical concurrent requests
   */
  async dedupe(key, requestFn) {
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    const promise = (async () => {
      try {
        const result = await requestFn();
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.inFlightRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
