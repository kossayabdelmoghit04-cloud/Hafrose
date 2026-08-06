import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/auth.service';

/**
 * useSession
 * Runs once on application mount to validate and rehydrate the authentication session.
 * Fetches the authenticated user profile from Laravel if a token exists in storage.
 */
export function useSession() {
  const { token, setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getProfile();
        setAuth(response.data, token);
      } catch {
        logout();
      }
    };

    validateSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
