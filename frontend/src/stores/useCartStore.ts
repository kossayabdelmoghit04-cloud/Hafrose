import { create } from 'zustand';
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

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isDrawerOpen: false,

  addItem: () => {
    // Implementation placeholder - to be populated in future feature phase
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
}));
