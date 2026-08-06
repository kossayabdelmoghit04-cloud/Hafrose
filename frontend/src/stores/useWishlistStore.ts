import { create } from 'zustand';
import { WishlistItem } from '../types/models';

export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;

  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.product_id !== productId) })),
  isWishlisted: (productId) => get().items.some((item) => item.product_id === productId),
}));
