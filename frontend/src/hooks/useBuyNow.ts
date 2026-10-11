import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { Product } from '../types/models';

export type BuyNowResult = 'success' | 'no_stock' | 'needs_variant' | 'error';

export interface UseBuyNowOptions {
  /** Called on every result to surface a user-facing message.
   *  If not provided, the hook is silent (caller handles feedback). */
  onFeedback?: (result: BuyNowResult, product: Product) => void;
}

export interface UseBuyNowReturn {
  /** Trigger direct purchase for a product from the Home Page.
   *  Cas A — no mandatory variant → add to cart → navigate to /checkout
   *  Cas B — product has color/size variant → redirect to product page (intent preserved via URL)
   *  Cas C — out of stock → call onFeedback, no navigation
   */
  buyNow: (product: Product) => void;
  /** True while the add-to-cart + navigation is in progress (guards against double-click) */
  isBuying: boolean;
  /** Product id currently being processed (for per-card loading state) */
  buyingProductId: number | null;
}

/**
 * useBuyNow — MC-09
 *
 * Implements the "ACHETER" direct purchase action for Home Page product cards.
 *
 * Security constraints (Phase 2):
 * - Reuses the official useCartStore.addItem (no price override)
 * - No duplicate order creation — only navigates to /checkout
 * - Double-click protected via isBuying flag + ref guard
 * - Stock check is advisory (frontend only); backend re-validates at checkout
 * - Does NOT bypass auth: checkout handles its own auth rules
 */
export function useBuyNow(options: UseBuyNowOptions = {}): UseBuyNowReturn {
  const { onFeedback } = options;
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const [isBuying, setIsBuying] = useState(false);
  const [buyingProductId, setBuyingProductId] = useState<number | null>(null);

  // Ref guard prevents race conditions from simultaneous calls
  const isProcessingRef = useRef(false);

  const buyNow = useCallback(
    (product: Product) => {
      // ── Double-click guard ──────────────────────────────────────────────────
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      setIsBuying(true);
      setBuyingProductId(product.id);

      try {
        // ── Cas C — Product unavailable (frontend advisory check) ────────────
        const stock = product.stock ?? product.stock_quantity;
        if (typeof stock === 'number' && stock <= 0) {
          isProcessingRef.current = false;
          setIsBuying(false);
          setBuyingProductId(null);
          onFeedback?.('no_stock', product);
          return;
        }

        // ── Cas B — Product has mandatory variant selection ─────────────────
        // If the product explicitly defines variants or options that require selection on PDP
        const hasMandatoryVariants = Boolean(
          (product as unknown as { has_variants?: boolean }).has_variants ||
          (Array.isArray((product as unknown as { variants?: unknown[] }).variants) &&
            ((product as unknown as { variants: unknown[] }).variants.length > 0))
        );

        if (hasMandatoryVariants) {
          isProcessingRef.current = false;
          setIsBuying(false);
          setBuyingProductId(null);
          onFeedback?.('needs_variant', product);
          navigate(`/product/${product.slug}?buyNow=1`);
          return;
        }

        // ── Cas A — Simple product, no mandatory variant ─────────────────────
        // Add 1 unit to the existing cart (never clears pre-existing items).
        addItem(product, 1);

        // Keep drawer closed — we navigate directly to checkout instead.
        setDrawerOpen(false);

        // Provide success feedback before navigation.
        onFeedback?.('success', product);

        // Navigate to checkout via React Router (preserves SPA, no window.location.href).
        navigate('/checkout');

        // Maintain the guard active during the navigation transition to prevent rapid re-triggering
        setTimeout(() => {
          isProcessingRef.current = false;
          setIsBuying(false);
          setBuyingProductId(null);
        }, 2000);
      } catch {
        isProcessingRef.current = false;
        setIsBuying(false);
        setBuyingProductId(null);
        onFeedback?.('error', product);
      }
    },
    [addItem, setDrawerOpen, navigate, onFeedback]
  );

  return { buyNow, isBuying, buyingProductId };
}
