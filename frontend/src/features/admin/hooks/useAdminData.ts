import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/admin.service';

export const ADMIN_KEYS = {
  dashboard: ['admin', 'dashboard'],
  analytics: ['admin', 'analytics'],
  products: (params?: any) => ['admin', 'products', params],
  categories: (params?: any) => ['admin', 'categories', params],
  orders: (params?: any) => ['admin', 'orders', params],
  orderDetails: (id: number) => ['admin', 'orders', id],
  reviews: (params?: any) => ['admin', 'reviews', params],
  contacts: (params?: any) => ['admin', 'contacts', params],
  media: ['admin', 'media'],
  settings: ['admin', 'settings'],
  adminLogs: (params?: any) => ['admin', 'logs', params],
  activityLogs: (params?: any) => ['admin', 'activityLogs', params],
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
export function useAdminProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.products(params),
    queryFn: async () => {
      const res = await adminService.getProducts(params);
      return res.data;
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
export function useAdminCategories(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.categories(params),
    queryFn: async () => {
      const res = await adminService.getCategories(params);
      return res.data;
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
export function useAdminOrders(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.orders(params),
    queryFn: async () => {
      const res = await adminService.getOrders(params);
      return res.data;
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
export function useAdminReviews(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.reviews(params),
    queryFn: async () => {
      const res = await adminService.getReviews(params);
      return res.data;
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
export function useAdminContacts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.contacts(params),
    queryFn: async () => {
      const res = await adminService.getContacts(params);
      return res.data;
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
      const res = await adminService.getMedia();
      return res.data;
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
      const res = await adminService.getSettings();
      return res.data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.updateSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.settings });
      // Invalider aussi le cache public pour que les sections home reflètent les changements
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}

// Logs Hooks
export function useAdminLogs(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.adminLogs(params),
    queryFn: async () => {
      const res = await adminService.getAdminLogs(params);
      return res.data;
    },
  });
}

export function useActivityLogs(params?: Record<string, any>) {
  return useQuery({
    queryKey: ADMIN_KEYS.activityLogs(params),
    queryFn: async () => {
      const res = await adminService.getActivityLogs(params);
      return res.data;
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
