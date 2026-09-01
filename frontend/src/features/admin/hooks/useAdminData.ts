import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/admin.service';
import {
  AdminProductFilters,
  AdminOrderFilters,
  AdminReviewFilters,
  AdminContactFilters,
  AdminLogFilters,
} from '../../../types/admin.types';

export const ADMIN_KEYS = {
  dashboard: ['admin', 'dashboard'],
  analytics: ['admin', 'analytics'],
  products: (params?: AdminProductFilters) => ['admin', 'products', params],
  categories: (params?: AdminProductFilters) => ['admin', 'categories', params],
  orders: (params?: AdminOrderFilters) => ['admin', 'orders', params],
  orderDetails: (id: number) => ['admin', 'orders', id],
  reviews: (params?: AdminReviewFilters) => ['admin', 'reviews', params],
  contacts: (params?: AdminContactFilters) => ['admin', 'contacts', params],
  media: ['admin', 'media'],
  settings: ['admin', 'settings'],
  adminLogs: (params?: AdminLogFilters) => ['admin', 'logs', params],
  activityLogs: (params?: AdminLogFilters) => ['admin', 'activityLogs', params],
  systemHealth: ['admin', 'systemHealth'],
};

// Dashboard Hook
export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_KEYS.dashboard,
    queryFn: async () => {
      const res = await adminService.getDashboard();
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Analytics Hook
export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics,
    queryFn: async () => {
      const res = await adminService.getAnalytics();
      return res.data;
    },
  });
}

// Products Hooks
export function useAdminProducts(params?: AdminProductFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.products(params),
    queryFn: async () => {
      return adminService.getProducts(params);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      adminService.updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

// Categories Hooks
export function useAdminCategories(params?: AdminProductFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.categories(params),
    queryFn: async () => {
      return adminService.getCategories(params);
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      adminService.updateCategory(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

// Orders Hooks
export function useAdminOrders(params?: AdminOrderFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.orders(params),
    queryFn: async () => {
      return adminService.getOrders(params);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

// Reviews Hooks
export function useAdminReviews(params?: AdminReviewFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.reviews(params),
    queryFn: async () => {
      return adminService.getReviews(params);
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

// Contacts Hooks
export function useAdminContacts(params?: AdminContactFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.contacts(params),
    queryFn: async () => {
      return adminService.getContacts(params);
    },
  });
}

export function useMarkContactAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.markContactAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

// Media Hooks
export function useAdminMedia() {
  return useQuery({
    queryKey: ADMIN_KEYS.media,
    queryFn: async () => {
      return adminService.getMedia();
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.uploadMedia(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.media });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.media });
    },
  });
}

// Settings Hooks
export function useAdminSettings() {
  return useQuery({
    queryKey: ADMIN_KEYS.settings,
    queryFn: async () => {
      return adminService.getSettings();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.updateSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.settings });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}

// Logs Hooks
export function useAdminLogs(params?: AdminLogFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.adminLogs(params),
    queryFn: async () => {
      return adminService.getAdminLogs(params);
    },
  });
}

export function useActivityLogs(params?: AdminLogFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.activityLogs(params),
    queryFn: async () => {
      return adminService.getActivityLogs(params);
    },
  });
}

// System Health & Cache Hooks
export function useSystemHealth() {
  return useQuery({
    queryKey: ADMIN_KEYS.systemHealth,
    queryFn: async () => {
      const res = await adminService.getSystemHealth();
      return res.data;
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminService.clearCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
