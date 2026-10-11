import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/storage.constants';

export type AdminThemeMode = 'dark' | 'light';

export interface AdminThemeState {
  adminTheme: AdminThemeMode;
  setAdminTheme: (theme: AdminThemeMode) => void;
  toggleAdminTheme: () => void;
}

const getInitialTheme = (): AdminThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_THEME_PREFERENCE);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore localStorage errors (e.g. incognito / restricted security context)
  }
  return 'dark';
};

export const useAdminThemeStore = create<AdminThemeState>((set) => ({
  adminTheme: getInitialTheme(),

  setAdminTheme: (theme: AdminThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_THEME_PREFERENCE, theme);
    } catch {
      // Ignore storage error
    }
    set({ adminTheme: theme });
  },

  toggleAdminTheme: () => {
    set((state) => {
      const nextTheme: AdminThemeMode = state.adminTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_THEME_PREFERENCE, nextTheme);
      } catch {
        // Ignore storage error
      }
      return { adminTheme: nextTheme };
    });
  },
}));
