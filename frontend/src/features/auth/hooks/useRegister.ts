import { useApiMutation } from '../../../hooks/useApiMutation';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../stores/useAuthStore';
import { RegisterPayload, AuthResponse } from '../../../types/auth';
import { ApiResponse } from '../../../types/api';

/**
 * useRegister
 * Orchestrates the customer registration flow.
 * On success, immediately authenticates the customer.
 */
export function useRegister() {
  const { setAuth } = useAuthStore();

  const { mutate: register, isLoading, error } = useApiMutation<
    RegisterPayload,
    ApiResponse<AuthResponse>
  >({
    mutationFn: authService.register,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
    },
  });

  return { register, isLoading, error };
}
