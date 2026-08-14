import apiClient from './apiClient';
import { ApiResponse } from '../types/api';

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

export interface AdminDashboardData {
  metrics: AdminMetrics;
  sales_chart: AdminSalesChartItem[];
  popular_products: AdminPopularProduct[];
  latest_orders: Array<{
    id: number;
    customer_name: string;
    phone: string;
    city: string;
    total_price: string | number;
    status: string;
    created_at: string;
  }>;
  latest_messages: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    is_read: boolean;
    created_at: string;
  }>;
}

export const adminService = {
  // Dashboard
  async getDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get('/admin/dashboard');
  },

  // Analytics
  async getAnalytics(): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/analytics');
  },

  // Products
  async getProducts(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/products', { params });
  },

  async createProduct(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.post('/admin/products', formData);
  },

  async updateProduct(id: number, formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.post(`/admin/products/${id}`, formData);
  },

  async deleteProduct(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`/admin/products/${id}`);
  },

  // Categories
  async getCategories(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/categories', { params });
  },

  async createCategory(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.post('/admin/categories', formData);
  },

  async updateCategory(id: number, formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.post(`/admin/categories/${id}`, formData);
  },

  async deleteCategory(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`/admin/categories/${id}`);
  },

  // Orders
  async getOrders(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/orders', { params });
  },

  async getOrderDetails(id: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },

  // Reviews
  async getReviews(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/reviews', { params });
  },

  async approveReview(id: number): Promise<ApiResponse<any>> {
    return apiClient.patch(`/admin/reviews/${id}/approve`);
  },

  async rejectReview(id: number): Promise<ApiResponse<any>> {
    return apiClient.patch(`/admin/reviews/${id}/reject`);
  },

  async deleteReview(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`/admin/reviews/${id}`);
  },

  // Contacts
  async getContacts(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/contacts', { params });
  },

  async markContactAsRead(id: number): Promise<ApiResponse<any>> {
    return apiClient.patch(`/admin/contacts/${id}/read`);
  },

  async deleteContact(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`/admin/contacts/${id}`);
  },

  // Media
  async getMedia(): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/media');
  },

  async uploadMedia(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.post('/admin/media', formData);
  },

  async deleteMedia(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`/admin/media/${id}`);
  },

  // Settings
  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/settings');
  },

  async updateSettings(settings: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.post('/admin/settings', { settings });
  },

  // Logs
  async getAdminLogs(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/logs', { params });
  },

  async getActivityLogs(params?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/activity-logs', { params });
  },

  // System
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/system/health');
  },

  async clearCache(): Promise<ApiResponse<any>> {
    return apiClient.post('/admin/cache/clear');
  },
};
