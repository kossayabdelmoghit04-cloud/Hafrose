import { create } from 'zustand';

export type CurrencyType = 'EUR' | 'USD' | 'MAD';
export type LanguageType = 'fr' | 'en' | 'ar';

export interface ThemeState {
  currency: CurrencyType;
  language: LanguageType;

  setCurrency: (currency: CurrencyType) => void;
  setLanguage: (language: LanguageType) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currency: 'EUR',
  language: 'fr',

  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
}));
