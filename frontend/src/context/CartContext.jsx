import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

/**
 * CartProvider holds global shopping cart state with local storage persistence.
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem('hafrose_cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
      return [];
    }
  });

  // Sync cart state with localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('hafrose_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  /**
   * Add an item to the cart or increment quantity if already present
   * Clamps quantity to the product's available stock
   */
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
      const maxStock = product.stock !== undefined ? product.stock : 10;

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        const existingItem = newCart[existingItemIndex];
        const newQty = existingItem.quantity + quantity;
        existingItem.quantity = Math.min(newQty, maxStock);
        return newCart;
      } else {
        const qty = Math.min(quantity, maxStock);
        return [...prevCart, { product, quantity: qty }];
      }
    });
  };

  /**
   * Remove a product from the cart completely
   */
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  /**
   * Update quantity of a specific item in the cart
   */
  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock !== undefined ? item.product.stock : 10;
          const cleanQty = Math.max(1, Math.min(quantity, maxStock));
          return { ...item, quantity: cleanQty };
        }
        return item;
      })
    );
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use the Cart Context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
