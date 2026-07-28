/**
 * HAFROSE — Unified Analytics Service (Phase 5.11)
 *
 * Provides a single interface for GA4, GTM, and Meta Pixel event firing.
 * All events respect user consent before sending any tracking data.
 *
 * Events tracked:
 *  - view_item         (product viewed)
 *  - add_to_cart
 *  - remove_from_cart
 *  - begin_checkout
 *  - purchase
 *  - search
 *  - add_to_wishlist
 */

const CONSENT_KEY = 'hafrose_analytics_consent';

// ── Consent Helpers ────────────────────────────────────────────────

export function hasAnalyticsConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

export function grantAnalyticsConsent() {
  localStorage.setItem(CONSENT_KEY, 'granted');
  // Initialize GTM dataLayer consent update
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
    });
  }
}

export function revokeAnalyticsConsent() {
  localStorage.setItem(CONSENT_KEY, 'denied');
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  }
}

// ── Internal push helper ───────────────────────────────────────────

function push(eventName, params = {}) {
  if (!hasAnalyticsConsent()) return;

  // GA4 / GTM dataLayer
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });

    // Native gtag call (fallback for non-GTM setup)
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }

    // Meta Pixel
    if (window.fbq) {
      // Map GA4 event names to Meta standard events
      const metaMap = {
        view_item: 'ViewContent',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        purchase: 'Purchase',
        search: 'Search',
        add_to_wishlist: 'AddToWishlist',
      };
      const metaEvent = metaMap[eventName];
      if (metaEvent) {
        window.fbq('track', metaEvent, params);
      }
    }
  }
}

// ── E-Commerce Event Helpers ───────────────────────────────────────

/**
 * Track a product page view
 */
export function trackProductView(product) {
  push('view_item', {
    currency: 'EUR',
    value: parseFloat(product?.price ?? 0),
    items: [{
      item_id: product?.id,
      item_name: product?.name,
      item_category: product?.category?.name,
      price: parseFloat(product?.price ?? 0),
      quantity: 1,
    }],
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product, quantity = 1) {
  push('add_to_cart', {
    currency: 'EUR',
    value: parseFloat(product?.price ?? 0) * quantity,
    items: [{
      item_id: product?.id,
      item_name: product?.name,
      item_category: product?.category?.name,
      price: parseFloat(product?.price ?? 0),
      quantity,
    }],
  });
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(product, quantity = 1) {
  push('remove_from_cart', {
    currency: 'EUR',
    value: parseFloat(product?.price ?? 0) * quantity,
    items: [{
      item_id: product?.id,
      item_name: product?.name,
      price: parseFloat(product?.price ?? 0),
      quantity,
    }],
  });
}

/**
 * Track checkout initiation
 */
export function trackBeginCheckout(cart) {
  const items = (cart?.items || []).map((item) => ({
    item_id: item.product?.id,
    item_name: item.product?.name,
    price: parseFloat(item.price ?? 0),
    quantity: item.quantity,
  }));
  push('begin_checkout', {
    currency: 'EUR',
    value: cart?.total ?? 0,
    items,
  });
}

/**
 * Track successful purchase
 */
export function trackPurchase(order) {
  const items = (order?.items || []).map((item) => ({
    item_id: item.product?.id,
    item_name: item.product?.name,
    price: parseFloat(item.unit_price ?? 0),
    quantity: item.quantity,
  }));
  push('purchase', {
    transaction_id: String(order?.id),
    currency: 'EUR',
    value: parseFloat(order?.total_price ?? 0),
    items,
  });
}

/**
 * Track a search query
 */
export function trackSearch(query) {
  push('search', { search_term: query });
}

/**
 * Track add to wishlist
 */
export function trackAddToWishlist(product) {
  push('add_to_wishlist', {
    currency: 'EUR',
    value: parseFloat(product?.price ?? 0),
    items: [{
      item_id: product?.id,
      item_name: product?.name,
      item_category: product?.category?.name,
      price: parseFloat(product?.price ?? 0),
      quantity: 1,
    }],
  });
}

const analytics = {
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackAddToWishlist,
  hasConsent: hasAnalyticsConsent,
  grantConsent: grantAnalyticsConsent,
  revokeConsent: revokeAnalyticsConsent,
};

export default analytics;
