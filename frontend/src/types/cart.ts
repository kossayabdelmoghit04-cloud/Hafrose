import { Product } from './models';

export interface CartItem {
  id: string; // Unique cart item key (e.g., productId + selected variant options)
  product: Product;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  unit_price: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  estimated_shipping: number;
  total: number;
  item_count: number;
}
