import { create } from 'zustand';
import { User } from '../types/models';
import { STORAGE_KEYS } from '../constants/storage.constants';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const storedUserRaw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
let storedUser: User | null = null;
if (storedUserRaw) {
  try {
    storedUser = JSON.parse(storedUserRaw);
  } catch {
    storedUser = null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: Boolean(storedToken && storedUser),
  isLoading: Boolean(storedToken && !storedUser),

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    set({ user });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));

