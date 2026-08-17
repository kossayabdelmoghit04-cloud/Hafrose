import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/auth.service';
import { User } from '../types/models';

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
        const userData = (response && 'data' in response && response.data) ? response.data : response;
        if (userData && (userData as User).id) {
          setAuth(userData as User, token);
        } else {
          setLoading(false);
        }
      } catch {
        logout();
      }
    };

    validateSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

