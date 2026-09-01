import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAuthService, AdminLoginPayload, AdminAuthResponse } from '../../../services/adminAuth.service';
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
    mutationFn: async (payload: AdminLoginPayload): Promise<AdminAuthResponse> => {
      const response = await adminAuthService.login(payload);
      const raw = response as unknown as { data?: AdminAuthResponse; token?: string; user?: User };
      const authData: AdminAuthResponse = (raw.data?.token ? raw.data : raw) as AdminAuthResponse;
      if (!authData || !authData.token || !authData.user) {
        throw new Error('Réponse de connexion invalide du serveur.');
      }
      return authData;
    },
    onSuccess: (data: AdminAuthResponse) => {
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

