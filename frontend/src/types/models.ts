export type RoleType = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  role: RoleType;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description?: string | null;
  description: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category?: Category;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  address_name: string;
  recipient_name: string;
  street_address: string;
  city: string;
  state_province?: string | null;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  shipping_address_id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal_amount: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string | null;
  items?: OrderItem[];
  shipping_address?: UserAddress;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product?: Product;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string | null;
  is_approved: boolean;
  user?: User;
  created_at: string;
}
