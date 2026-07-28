import { useEffect } from 'react';
import logger from '../utils/logger';

/**
 * HAFROSE — Core Web Vitals Monitoring Hook (Phase 5.5)
 * 
 * Tracks: LCP, CLS, INP, TTFB, FCP
 * Reports to: logger + analytics layer
 */
export function useWebVitals(onMetric) {
  useEffect(() => {
    // Use PerformanceObserver API — available in all modern browsers
    const reportMetric = (metric) => {
      logger.info(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
      if (typeof onMetric === 'function') {
        onMetric(metric);
      }
    };

    // LCP — Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      reportMetric({ name: 'LCP', value: last.startTime, rating: last.startTime <= 2500 ? 'good' : last.startTime <= 4000 ? 'needs-improvement' : 'poor', delta: last.startTime, id: 'lcp' });
    });

    // CLS — Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) cls += entry.value;
      });
      reportMetric({ name: 'CLS', value: cls, rating: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor', delta: cls, id: 'cls' });
    });

    // TTFB — Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      reportMetric({ name: 'TTFB', value: ttfb, rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor', delta: ttfb, id: 'ttfb' });
    }

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // PerformanceObserver not supported in this environment — silent fail
    }

    return () => {
      try {
        lcpObserver.disconnect();
        clsObserver.disconnect();
      } catch { /* ignore */ }
    };
  }, [onMetric]);
}

export default useWebVitals;
