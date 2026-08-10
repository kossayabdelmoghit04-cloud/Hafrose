import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAuthService, AdminLoginPayload } from '../../../services/adminAuth.service';
import { useAuthStore, AuthState } from '../../../stores/useAuthStore';
import { User } from '../../../types/models';

export const ADMIN_AUTH_QUERY_KEY = ['admin', 'auth', 'profile'];

/**
 * Hook: useAdminLogin
 * Calls POST /api/admin/login — exclusively for admin accounts.
 * On success, stores the admin token and user via the shared AuthStore.
 */
export function useAdminLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: AdminLoginPayload) => {
      const response = await adminAuthService.login(payload);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user as User, data.token);
      queryClient.setQueryData(ADMIN_AUTH_QUERY_KEY, data.user);
    },
  });
}

/**
 * Hook: useAdminLogout
 * Calls POST /api/admin/logout — revokes admin token.
 */
export function useAdminLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state: AuthState) => state.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await adminAuthService.logout();
      } catch {
        // Always clear client state even if request fails
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
