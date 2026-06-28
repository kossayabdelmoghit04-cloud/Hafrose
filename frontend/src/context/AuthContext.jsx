import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchroniser le token avec les en-têtes d'Axios et charger le profil utilisateur
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        localStorage.setItem('admin_token', token);
        // Configurer l'en-tête d'autorisation par défaut
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/admin/me');
          if (response.success) {
            setUser(response.data);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil administrateur :', error);
          handleLogout();
        }
      } else {
        localStorage.removeItem('admin_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
      setLoading(false);
    };

    loadProfile();
  }, [token]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await api.post('/admin/logout');
      }
    } catch (e) {
      console.warn('Erreur lors de la déconnexion serveur (déjà expiré ?) :', e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('admin_token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    login: handleLogin,
    logout: handleLogout,
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
