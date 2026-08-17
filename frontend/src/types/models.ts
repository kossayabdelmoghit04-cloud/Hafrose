export type RoleType = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  phone?: string | null;
  role: RoleType;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  is_active: boolean;
  image?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
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

export interface Gallery {
  id: number;
  product_id?: number;
  image: string;
  is_primary?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string | null;
  description: string;
  price: number;
  sale_price?: number | null;
  is_on_sale?: boolean;
  discount_percentage?: number | null;
  stock?: number;
  stock_quantity?: number;
  color?: string | null;
  material?: string | null;
  brand?: string | null;
  image?: string | null;
  is_active?: boolean;
  is_featured: boolean;
  category?: Category;
  galleries?: Gallery[];
  media?: Media[];
  reviews?: Review[];
  created_at: string;
  updated_at?: string;
}

export interface UserAddress {
  id: number;
  user_id?: number;
  title: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  unit_price: number;
  quantity: number;
  subtotal?: number;
  size?: string;
  color?: string;
  product?: Product;
}

export interface Order {
  id: number;
  order_number?: string;
  user_id?: number;
  customer_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  subtotal_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  shipping_method?: string;
  discount_amount?: number;
  total_amount?: number;
  total_price?: number;
  status: OrderStatus;
  payment_status?: PaymentStatus | string;
  payment_method?: string;
  notes?: string | null;
  order_items?: OrderItem[];
  items?: OrderItem[];
  shipping_address?: UserAddress | {
    name?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: number;
  user_id?: number;
  product_id?: number;
  product?: Product;
  category?: Category | null;
  gallery_principale?: string | null;
  created_at?: string;
  updated_at?: string;
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

