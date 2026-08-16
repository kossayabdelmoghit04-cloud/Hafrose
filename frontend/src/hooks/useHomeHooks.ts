import { useQuery } from '@tanstack/react-query';
import { homeService, HomeData, SiteSettings } from '../services/home.service';
import { ApiResponse } from '../types/api';

export const HOME_QUERY_KEY = ['home'] as const;
export const SITE_SETTINGS_QUERY_KEY = ['site-settings'] as const;

/**
 * useHomeData
 * Charge toutes les données dynamiques de la page d'accueil via GET /api/home.
 * Renvoie hero, editorial, promo et site settings avec URLs résolues.
 */
export function useHomeData() {
  return useQuery<ApiResponse<HomeData>, Error>({
    queryKey: HOME_QUERY_KEY,
    queryFn: () => homeService.getHomeData(),
    staleTime: 1000 * 60 * 10, // 10 min — données rarement modifiées en prod
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * usePublicSettings
 * Charge les paramètres publics du site (logo, nom, devise, SEO, etc.)
 * via GET /api/settings.
 */
export function usePublicSettings() {
  return useQuery<ApiResponse<SiteSettings>, Error>({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: () => homeService.getPublicSettings(),
    staleTime: 1000 * 60 * 30, // 30 min — paramètres très stables
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
