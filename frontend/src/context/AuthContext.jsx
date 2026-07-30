import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import api from '../services/api';
import customerAuthService from '../services/customerAuthService';
import { crossTabSync } from '../services/network/crossTabSync';
import { syncMonitor } from '../lib/syncMonitor';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // ── Admin State ─────────────────────────────────────────────────────────────
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Customer State ──────────────────────────────────────────────────────────
  const [customerToken, setCustomerToken] = useState(customerAuthService.getToken());
  const [customerUser, setCustomerUser] = useState(customerAuthService.getUser());

  // Listen to cross-tab auth events
  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((msg) => {
      if (msg.type === 'AUTH_LOGIN' || msg.type === 'AUTH_LOGOUT') {
        syncMonitor.recordCrossTabEvent();
        setCustomerToken(customerAuthService.getToken());
        setCustomerUser(customerAuthService.getUser());
        queryClient.invalidateQueries();
      }
    });
    return unsubscribe;
  }, [queryClient]);

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
  const handleAdminLogin = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  }, []);

  const handleAdminLogout = useCallback(async () => {
    try {
      if (token) await api.post('/admin/logout');
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  // ── Customer Handlers ───────────────────────────────────────────────────────
  const handleCustomerLogin = useCallback(async (credentials) => {
    const res = await customerAuthService.login(credentials);
    if (res?.success) {
      setCustomerToken(customerAuthService.getToken());
      setCustomerUser(customerAuthService.getUser());
      crossTabSync.broadcast('AUTH_LOGIN');
      queryClient.invalidateQueries();
    }
    return res;
  }, [queryClient]);

  const handleCustomerRegister = useCallback(async (data) => {
    const res = await customerAuthService.register(data);
    if (res?.success) {
      setCustomerToken(customerAuthService.getToken());
      setCustomerUser(customerAuthService.getUser());
      crossTabSync.broadcast('AUTH_LOGIN');
      queryClient.invalidateQueries();
    }
    return res;
  }, [queryClient]);

  const handleCustomerLogout = useCallback(async () => {
    await customerAuthService.logout();
    setCustomerToken(null);
    setCustomerUser(null);
    crossTabSync.broadcast('AUTH_LOGOUT');
    queryClient.clear();
  }, [queryClient]);

  const updateCustomerProfile = useCallback((updatedData) => {
    setCustomerUser((prev) => {
      const updated = { ...prev, ...updatedData };
      customerAuthService.setUser(updated);
      return updated;
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token && !!user,
      login: handleAdminLogin,
      logout: handleAdminLogout,

      customerToken,
      customerUser,
      isCustomerAuthenticated: !!customerToken && !!customerUser,
      customerLogin: handleCustomerLogin,
      customerRegister: handleCustomerRegister,
      customerLogout: handleCustomerLogout,
      updateCustomerProfile,
    }),
    [
      token,
      user,
      loading,
      handleAdminLogin,
      handleAdminLogout,
      customerToken,
      customerUser,
      handleCustomerLogin,
      handleCustomerRegister,
      handleCustomerLogout,
      updateCustomerProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
