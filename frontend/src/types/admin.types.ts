/**
 * DTOs de la couche Administration — HAFROSE
 *
 * Ce fichier centralise les types spécifiques aux endpoints admin
 * qui ne sont pas couverts par les types généraux de models.ts.
 *
 * Les types Product, Category, Order, OrderItem, Review, Media, User
 * sont réutilisés directement depuis models.ts.
 */

// ─── Metrics & Dashboard ──────────────────────────────────────────────────────

export interface AdminMetrics {
  products_count: number;
  categories_count: number;
  orders_count: number;
  pending_orders: number;
  revenue: number;
  pending_reviews: number;
  unread_contacts: number;
}

export interface AdminSalesChartItem {
  date: string;
  sales: number;
  count: number;
}

export interface AdminPopularProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  sales_qty: number;
}

export interface AdminDashboardOrderSummary {
  id: number;
  customer_name: string;
  phone: string;
  city: string;
  total_price: string | number;
  status: string;
  created_at: string;
}

export interface AdminDashboardMessageSummary {
  id: number;
  name: string;
  email: string;
  subject: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  sales_chart: AdminSalesChartItem[];
  popular_products: AdminPopularProduct[];
  latest_orders: AdminDashboardOrderSummary[];
  latest_messages: AdminDashboardMessageSummary[];
}

// ─── Contact (formulaire de contact) ─────────────────────────────────────────

export interface AdminContact {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  body?: string | null; // alias possible selon l'API
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export interface AdminLog {
  id: number;
  admin_id?: number | null;
  user_id?: number | null;
  user_email?: string | null;
  user?: {
    id: number;
    email: string;
    role?: string;
  } | null;
  action?: string | null;
  event_type?: string | null;
  resource?: string | null;
  resource_id?: number | string | null;
  description?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  category?: string | null;
  created_at: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AdminSettings {
  // Généraux
  site_name?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  currency?: string | null;
  shipping_fee?: number | string | null;
  free_shipping_threshold?: number | string | null;
  // Hero section
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_description?: string | null;
  hero_primary_btn_text?: string | null;
  hero_primary_btn_url?: string | null;
  hero_secondary_btn_text?: string | null;
  hero_secondary_btn_url?: string | null;
  hero_image_url?: string | null;
  // Editorial section
  editorial_eyebrow?: string | null;
  editorial_title?: string | null;
  editorial_description?: string | null;
  editorial_quote?: string | null;
  editorial_btn_text?: string | null;
  editorial_btn_url?: string | null;
  editorial_image_url?: string | null;
  // Promo section
  promo_badge?: string | null;
  promo_title?: string | null;
  promo_subtitle?: string | null;
  promo_description?: string | null;
  promo_btn_text?: string | null;
  promo_btn_url?: string | null;
  promo_image_url?: string | null;
  // Champs dynamiques supplémentaires
  [key: string]: string | number | boolean | null | undefined;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AdminAnalyticsData {
  period?: string;
  revenue?: number;
  orders_count?: number;
  products_count?: number;
  [key: string]: string | number | boolean | null | undefined;
}

// ─── System Health ────────────────────────────────────────────────────────────

export interface AdminSystemHealth {
  status: 'ok' | 'degraded' | 'error';
  database?: 'ok' | 'error' | string;
  cache?: 'ok' | 'error' | string;
  storage?: 'ok' | 'error' | string;
  queue?: 'ok' | 'error' | string;
  memory_usage?: string | number;
  disk_free_mb?: number;
  uptime?: string;
  version?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// ─── Paramètres de pagination/filtres admin ───────────────────────────────────

export interface AdminPaginationParams {
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface AdminProductFilters extends AdminPaginationParams {
  search?: string;
  category_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface AdminOrderFilters extends AdminPaginationParams {
  search?: string;
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
}

export interface AdminReviewFilters extends AdminPaginationParams {
  search?: string;
  is_approved?: boolean;
  product_id?: number;
}

export interface AdminContactFilters extends AdminPaginationParams {
  search?: string;
  is_read?: boolean;
}

export interface AdminLogFilters extends AdminPaginationParams {
  search?: string;
  action?: string;
  from_date?: string;
  to_date?: string;
}
