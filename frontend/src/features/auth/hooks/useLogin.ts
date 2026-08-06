import { useApiMutation } from '../../../hooks/useApiMutation';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../stores/useAuthStore';
import { LoginPayload, AuthResponse } from '../../../types/auth';
import { ApiResponse } from '../../../types/api';

/**
 * useLogin
 * Orchestrates the customer login flow:
 *  1. Calls authService.login via the API
 *  2. On success, persists token and user into the AuthStore
 *
 * Used in: LoginPage, LoginForm component
 */
export function useLogin() {
  const { setAuth } = useAuthStore();

  const { mutate: login, isLoading, error } = useApiMutation<
    LoginPayload,
    ApiResponse<AuthResponse>
  >({
    mutationFn: authService.login,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
    },
  });

  return { login, isLoading, error };
}
