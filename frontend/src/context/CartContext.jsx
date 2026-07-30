import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { statePersistence } from '../lib/statePersistence';
import { crossTabSync } from '../services/network/crossTabSync';
import { syncMonitor } from '../lib/syncMonitor';

const CartContext = createContext(null);
const CART_PERSIST_KEY = 'cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    return statePersistence.getItem(CART_PERSIST_KEY, []);
  });

  // Sync to versioned persistence and broadcast cross-tab
  const updateCartState = useCallback((newCart) => {
    setCart(newCart);
    statePersistence.setItem(CART_PERSIST_KEY, newCart);
    crossTabSync.broadcast('CART_UPDATED', { cart: newCart });
    syncMonitor.recordStateUpdate();
  }, []);

  // Listen to cross-tab updates
  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((msg) => {
      if (msg.type === 'CART_UPDATED') {
        syncMonitor.recordCrossTabEvent();
        const latest = statePersistence.getItem(CART_PERSIST_KEY, []);
        setCart(latest);
      }
    });
    return unsubscribe;
  }, []);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
        const maxStock = product.stock !== undefined ? product.stock : 10;
        let newCart;

        if (existingItemIndex > -1) {
          newCart = [...prevCart];
          const existingItem = { ...newCart[existingItemIndex] };
          const newQty = existingItem.quantity + quantity;
          existingItem.quantity = Math.min(newQty, maxStock);
          newCart[existingItemIndex] = existingItem;
        } else {
          const qty = Math.min(quantity, maxStock);
          newCart = [...prevCart, { product, quantity: qty }];
        }

        statePersistence.setItem(CART_PERSIST_KEY, newCart);
        crossTabSync.broadcast('CART_UPDATED', { cart: newCart });
        return newCart;
      });
    },
    []
  );

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product.id !== productId);
      statePersistence.setItem(CART_PERSIST_KEY, newCart);
      crossTabSync.broadcast('CART_UPDATED', { cart: newCart });
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock !== undefined ? item.product.stock : 10;
          const cleanQty = Math.max(1, Math.min(quantity, maxStock));
          return { ...item, quantity: cleanQty };
        }
        return item;
      });
      statePersistence.setItem(CART_PERSIST_KEY, newCart);
      crossTabSync.broadcast('CART_UPDATED', { cart: newCart });
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    updateCartState([]);
  }, [updateCartState]);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0), [cart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
