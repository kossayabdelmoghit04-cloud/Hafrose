/**
 * HAFROSE — Synchronization Monitoring & Diagnostic Engine (Phase 14)
 * 
 * Measures state health:
 * - Cache Hit / Miss ratio
 * - Cross-Tab synchronization message counter
 * - Invalidations & Render ticks
 */

class SyncMonitorEngine {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      crossTabEvents: 0,
      queryInvalidations: 0,
      stateUpdates: 0,
      startTime: Date.now(),
    };
    this.listeners = new Set();
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
    this.notify();
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
    this.notify();
  }

  recordCrossTabEvent() {
    this.metrics.crossTabEvents++;
    this.notify();
  }

  recordInvalidation() {
    this.metrics.queryInvalidations++;
    this.notify();
  }

  recordStateUpdate() {
    this.metrics.stateUpdates++;
    this.notify();
  }

  getMetrics() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRatio = total > 0 ? (this.metrics.cacheHits / total) * 100 : 100;
    return {
      ...this.metrics,
      hitRatio: parseFloat(hitRatio.toFixed(2)),
      uptimeSeconds: Math.round((Date.now() - this.metrics.startTime) / 1000),
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const data = this.getMetrics();
    this.listeners.forEach((fn) => fn(data));
  }
}

export const syncMonitor = new SyncMonitorEngine();
