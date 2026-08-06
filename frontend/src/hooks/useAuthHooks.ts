import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, UpdateProfilePayload, ChangePasswordPayload } from '../services/auth.service';
import { LoginPayload, RegisterPayload } from '../types/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';

export const AUTH_QUERY_KEY = ['auth', 'profile'];

export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await authService.register(payload);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);
  const setItemsWishlist = useWishlistStore((state) => state.setItems);

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // Continue clearing client state even if request fails
      }
    },
    onSettled: () => {
      logout();
      clearCart();
      setItemsWishlist([]);
      queryClient.clear();
    },
  });
}

export function useProfile() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await authService.getProfile();
      setUser(response.data);
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await authService.updateProfile(payload);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await authService.changePassword(payload);
      return response.data;
    },
  });
}
