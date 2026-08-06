import { useCartStore } from '../../../stores/useCartStore';
import { CartSummary } from '../../../types/cart';

/**
 * useCart
 * Exposes the cart store with a computed cart summary.
 * The single access point for all cart-related UI.
 */
export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, toggleDrawer, isDrawerOpen } =
    useCartStore();

  const summary: CartSummary = {
    subtotal: items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0),
    discount: 0,
    estimated_shipping: 0,
    total: items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0),
    item_count: items.reduce((acc, item) => acc + item.quantity, 0),
  };

  return {
    items,
    summary,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    isDrawerOpen,
  };
}
