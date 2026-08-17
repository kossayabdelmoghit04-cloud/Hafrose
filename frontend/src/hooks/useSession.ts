import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/auth.service';
import { adminAuthService } from '../services/adminAuth.service';
import { User } from '../types/models';

/**
 * useSession
 * Runs once on application mount to validate and rehydrate the authentication session.
 *
 * CRITICAL RULE — Two separate systems:
 *  - Admin token   → validates via GET /api/admin/me
 *  - Customer token → validates via GET /api/auth/me
 *
 * The role stored in USER_DATA determines which endpoint to call,
 * preventing cross-contamination between admin and customer sessions.
 */
export function useSession() {
  const { token, user: storedUser, setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // Determine whether the stored session belongs to an admin or a customer.
      const isAdminSession =
        storedUser?.role === 'admin' || storedUser?.role === 'super_admin';

      try {
        if (isAdminSession) {
          // ── ADMIN PATH: validate via GET /api/admin/me ──────────────────
          const response = await adminAuthService.me();
          // The apiClient interceptor returns response.data directly
          const raw = response as unknown as { data?: { id?: number }; id?: number };
          const userData = raw?.id ? raw : (raw as any)?.data;

          if (userData && (userData as any).id) {
            setAuth(userData as unknown as User, token);
          } else {
            logout();
          }
        } else {
          // ── CUSTOMER PATH: validate via GET /api/auth/me ─────────────────
          const response = await authService.getProfile();
          const userData =
            response && 'data' in response && response.data ? response.data : response;

          if (userData && (userData as User).id) {
            setAuth(userData as User, token);
          } else {
            setLoading(false);
          }
        }
      } catch {
        // Token is invalid or expired — clear session cleanly.
        logout();
      }
    };

    validateSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
