import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasAnalyticsConsent,
  grantAnalyticsConsent,
  revokeAnalyticsConsent,
  trackProductView,
  trackAddToCart,
  trackSearch,
} from '../../services/analytics';

describe('Analytics Consent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns false when consent not set', () => {
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('grants consent correctly', () => {
    grantAnalyticsConsent();
    expect(hasAnalyticsConsent()).toBe(true);
    expect(localStorage.getItem('hafrose_analytics_consent')).toBe('granted');
  });

  it('revokes consent correctly', () => {
    grantAnalyticsConsent();
    revokeAnalyticsConsent();
    expect(hasAnalyticsConsent()).toBe(false);
    expect(localStorage.getItem('hafrose_analytics_consent')).toBe('denied');
  });
});

describe('Analytics Events (with consent)', () => {
  beforeEach(() => {
    localStorage.clear();
    grantAnalyticsConsent();
    window.dataLayer = [];
  });

  it('trackProductView pushes view_item event', () => {
    const product = { id: 1, name: 'Sac Cabas', price: '299.00', category: { name: 'Sacs' } };
    trackProductView(product);
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer[0].event).toBe('view_item');
    expect(window.dataLayer[0].items[0].item_name).toBe('Sac Cabas');
  });

  it('trackAddToCart pushes add_to_cart event', () => {
    const product = { id: 2, name: 'Bracelet', price: '150.00' };
    trackAddToCart(product, 2);
    expect(window.dataLayer[0].event).toBe('add_to_cart');
    expect(window.dataLayer[0].items[0].quantity).toBe(2);
  });

  it('trackSearch pushes search event with term', () => {
    trackSearch('collier or');
    expect(window.dataLayer[0].event).toBe('search');
    expect(window.dataLayer[0].search_term).toBe('collier or');
  });
});

describe('Analytics Events (without consent)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dataLayer = [];
  });

  it('does not push events when consent not granted', () => {
    const product = { id: 1, name: 'Test', price: '100' };
    trackProductView(product);
    expect(window.dataLayer).toHaveLength(0);
  });
});
