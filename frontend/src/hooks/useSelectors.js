import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

/**
 * HAFROSE — Fine-Grained Selectors (Phase 12 & 15)
 * 
 * Selective state hooks to prevent re-render cascades in header badges and UI buttons.
 */

export function useCartCount() {
  const { cartCount } = useCart();
  return cartCount;
}

export function useCartTotal() {
  const { cartTotal } = useCart();
  return cartTotal;
}

export function useWishlistCount() {
  const { wishlistCount } = useWishlist();
  return wishlistCount;
}

export function useIsWishlisted(productId) {
  const { isInWishlist } = useWishlist();
  return isInWishlist(productId);
}
