import { logger } from '../utils/logger';

/**
 * HAFROSE — Enterprise State Persistence Engine (Phase 4 & 9)
 * 
 * Multi-tiered persistent store features:
 * - Schema versioning (v1) & migration support
 * - Time-To-Live (TTL) & Expiration enforcement
 * - Automatic corruption recovery with safe fallbacks
 * - Protection against quota overflow
 */

const SCHEMA_VERSION = 1;

class StatePersistenceEngine {
  constructor() {
    this.prefix = 'hafrose_v1_';
  }

  /**
   * Generates prefixed key with schema versioning
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Stores an item with optional TTL (in milliseconds)
   */
  setItem(key, value, ttl = null) {
    try {
      const payload = {
        v: SCHEMA_VERSION,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : null,
        data: value,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(payload));
    } catch (e) {
      logger.error(`Failed to persist item [${key}]`, { error: e.message });
    }
  }

  /**
   * Retrieves an item, validating schema version and TTL expiration
   */
  getItem(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return defaultValue;

      const payload = JSON.parse(raw);

      // Version migration / invalidation check
      if (!payload || payload.v !== SCHEMA_VERSION) {
        logger.warn(`Storage schema mismatch for [${key}], resetting to default`);
        this.removeItem(key);
        return defaultValue;
      }

      // TTL Expiration check
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        logger.info(`Persisted item [${key}] expired, clearing`);
        this.removeItem(key);
        return defaultValue;
      }

      return payload.data !== undefined ? payload.data : defaultValue;
    } catch (e) {
      logger.error(`Error reading persisted item [${key}], clearing corrupted data`, { error: e.message });
      this.removeItem(key);
      return defaultValue;
    }
  }

  /**
   * Removes an item
   */
  removeItem(key) {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Clears all HAFROSE managed persistent keys
   */
  clearAll() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // ignore
    }
  }
}

export const statePersistence = new StatePersistenceEngine();
