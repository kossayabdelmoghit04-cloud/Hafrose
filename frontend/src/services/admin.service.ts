import apiClient from './apiClient';
import { ApiResponse, ApiPaginatedResponse } from '../types/api';
import { Product, Category, Order, Review, Media } from '../types/models';
import {
  AdminDashboardData,
  AdminAnalyticsData,
  AdminContact,
  AdminLog,
  AdminSettings,
  AdminSystemHealth,
  AdminProductFilters,
  AdminOrderFilters,
  AdminReviewFilters,
  AdminContactFilters,
  AdminLogFilters,
} from '../types/admin.types';

export type { AdminDashboardData };

export const adminService = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get('/admin/dashboard');
  },

  // ─── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(): Promise<ApiResponse<AdminAnalyticsData>> {
    return apiClient.get('/admin/analytics');
  },

  // ─── Products ──────────────────────────────────────────────────────────────

  async getProducts(params?: AdminProductFilters): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get('/admin/products', { params });
  },

  async createProduct(formData: FormData): Promise<ApiResponse<Product>> {
    return apiClient.post('/admin/products', formData);
  },

  async updateProduct(id: number, formData: FormData): Promise<ApiResponse<Product>> {
    return apiClient.post(`/admin/products/${id}`, formData);
  },

  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/products/${id}`);
  },

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories(params?: AdminProductFilters): Promise<ApiPaginatedResponse<Category>> {
    return apiClient.get('/admin/categories', { params });
  },

  async createCategory(formData: FormData): Promise<ApiResponse<Category>> {
    return apiClient.post('/admin/categories', formData);
  },

  async updateCategory(id: number, formData: FormData): Promise<ApiResponse<Category>> {
    return apiClient.post(`/admin/categories/${id}`, formData);
  },

  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/categories/${id}`);
  },

  // ─── Orders ────────────────────────────────────────────────────────────────

  async getOrders(params?: AdminOrderFilters): Promise<ApiPaginatedResponse<Order>> {
    return apiClient.get('/admin/orders', { params });
  },

  async getOrderDetails(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },

  // ─── Reviews ───────────────────────────────────────────────────────────────

  async getReviews(params?: AdminReviewFilters): Promise<ApiPaginatedResponse<Review>> {
    return apiClient.get('/admin/reviews', { params });
  },

  async approveReview(id: number): Promise<ApiResponse<null>> {
    return apiClient.patch(`/admin/reviews/${id}/approve`);
  },

  async rejectReview(id: number): Promise<ApiResponse<null>> {
    return apiClient.patch(`/admin/reviews/${id}/reject`);
  },

  async deleteReview(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/reviews/${id}`);
  },

  // ─── Contacts ──────────────────────────────────────────────────────────────

  async getContacts(params?: AdminContactFilters): Promise<ApiPaginatedResponse<AdminContact>> {
    return apiClient.get('/admin/contacts', { params });
  },

  async markContactAsRead(id: number): Promise<ApiResponse<null>> {
    return apiClient.patch(`/admin/contacts/${id}/read`);
  },

  async deleteContact(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/contacts/${id}`);
  },

  // ─── Media ─────────────────────────────────────────────────────────────────

  async getMedia(): Promise<ApiResponse<Media[]>> {
    return apiClient.get('/admin/media');
  },

  async uploadMedia(formData: FormData): Promise<ApiResponse<Media>> {
    return apiClient.post('/admin/media', formData);
  },

  async deleteMedia(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/media/${id}`);
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<ApiResponse<AdminSettings>> {
    return apiClient.get('/admin/settings');
  },

  async updateSettings(formData: FormData): Promise<ApiResponse<AdminSettings>> {
    return apiClient.post('/admin/settings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ─── Logs ──────────────────────────────────────────────────────────────────

  async getAdminLogs(params?: AdminLogFilters): Promise<ApiPaginatedResponse<AdminLog>> {
    return apiClient.get('/admin/logs', { params });
  },

  async getActivityLogs(params?: AdminLogFilters): Promise<ApiPaginatedResponse<AdminLog>> {
    return apiClient.get('/admin/activity-logs', { params });
  },

  // ─── System ────────────────────────────────────────────────────────────────

  async getSystemHealth(): Promise<ApiResponse<AdminSystemHealth>> {
    return apiClient.get('/admin/system/health');
  },

  async clearCache(): Promise<ApiResponse<null>> {
    return apiClient.post('/admin/cache/clear');
  },
};
