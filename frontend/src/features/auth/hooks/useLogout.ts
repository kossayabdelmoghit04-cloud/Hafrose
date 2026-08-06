import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../stores/useAuthStore';
import { ROUTES } from '../../../constants/routes.constants';

/**
 * useLogout
 * Orchestrates customer logout:
 *  1. Calls the Laravel logout endpoint (revokes Sanctum token)
 *  2. Clears the local auth store
 *  3. Redirects to the login page
 */
export function useLogout() {
  const { logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate(ROUTES.PUBLIC.HOME);
    }
  }, [clearAuth, navigate]);

  return { logout };
}
