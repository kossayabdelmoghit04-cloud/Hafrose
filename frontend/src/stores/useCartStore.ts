import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/cart';
import { Product } from '../types/models';

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product, quantity = 1, selectedSize, selectedColor) => {
        const cartItemId = `${product.id}-${selectedSize ?? 'default'}-${selectedColor ?? 'default'}`;
        set((state) => {
          const existing = state.items.find((item) => item.id === cartItemId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === cartItemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isDrawerOpen: true,
            };
          }
          const newItem: CartItem = {
            id: cartItemId,
            product,
            quantity,
            unit_price: Number(product.sale_price ?? product.price),
            selected_size: selectedSize,
            selected_color: selectedColor,
          };
          return { items: [...state.items, newItem], isDrawerOpen: true };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== cartItemId) }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
    }),
    {
      name: 'hafrose_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
