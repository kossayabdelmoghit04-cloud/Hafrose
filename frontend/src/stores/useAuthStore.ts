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

export const useAuthStore = create<AuthState>((set) => ({
  // If a token exists in storage, start as authenticated while session rehydrates.
  // isLoading=true prevents ProtectedRoute from redirecting prematurely.
  user: null,
  token: storedToken,
  isAuthenticated: false, // Set to true only after profile is confirmed by useSession
  isLoading: Boolean(storedToken), // Loading until session is validated

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
