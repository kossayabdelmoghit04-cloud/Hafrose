import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import customerAuthService from '../services/customerAuthService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ── Admin State ─────────────────────────────────────────────────────────────
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Customer State ──────────────────────────────────────────────────────────
  const [customerToken, setCustomerToken] = useState(customerAuthService.getToken());
  const [customerUser, setCustomerUser] = useState(customerAuthService.getUser());

  // ── Load Admin Profile ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadAdminProfile = async () => {
      if (token) {
        localStorage.setItem('admin_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('/admin/me');
          if (response.success) {
            setUser(response.data);
          } else {
            handleAdminLogout();
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil admin :', error);
          handleAdminLogout();
        }
      } else {
        localStorage.removeItem('admin_token');
        setUser(null);
      }
      setLoading(false);
    };

    loadAdminProfile();
  }, [token]);

  // ── Load Customer Profile ───────────────────────────────────────────────────
  useEffect(() => {
    if (customerToken) {
      customerAuthService.fetchMe().then((usr) => {
        if (usr) setCustomerUser(usr);
      });
    }
  }, [customerToken]);

  // ── Admin Handlers ──────────────────────────────────────────────────────────
  const handleAdminLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const handleAdminLogout = async () => {
    try {
      if (token) await api.post('/admin/logout');
    } catch (e) {
      console.warn('Erreur déconnexion admin :', e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('admin_token');
    }
  };

  // ── Customer Handlers ───────────────────────────────────────────────────────
  const handleCustomerLogin = useCallback(async (credentials) => {
    const res = await customerAuthService.login(credentials);
    if (res?.success) {
      setCustomerToken(customerAuthService.getToken());
      setCustomerUser(customerAuthService.getUser());
    }
    return res;
  }, []);

  const handleCustomerRegister = useCallback(async (data) => {
    const res = await customerAuthService.register(data);
    if (res?.success) {
      setCustomerToken(customerAuthService.getToken());
      setCustomerUser(customerAuthService.getUser());
    }
    return res;
  }, []);

  const handleCustomerLogout = useCallback(async () => {
    await customerAuthService.logout();
    setCustomerToken(null);
    setCustomerUser(null);
  }, []);

  const updateCustomerProfile = useCallback((updatedData) => {
    setCustomerUser((prev) => {
      const updated = { ...prev, ...updatedData };
      customerAuthService.setUser(updated);
      return updated;
    });
  }, []);

  const value = {
    // Admin interface (backward compatibility)
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    login: handleAdminLogin,
    logout: handleAdminLogout,

    // Customer interface
    customerToken,
    customerUser,
    isCustomerAuthenticated: !!customerToken && !!customerUser,
    customerLogin: handleCustomerLogin,
    customerRegister: handleCustomerRegister,
    customerLogout: handleCustomerLogout,
    updateCustomerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
