import apiClient from './apiClient';
import { ApiResponse } from '../types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HomeHeroData {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  primary_btn_text: string;
  primary_btn_url: string;
  secondary_btn_text: string;
  secondary_btn_url: string;
  /** URL absolue résolue côté serveur, ex: http://localhost:8000/storage/hero/hero-main.png */
  image_url: string | null;
  is_active: boolean;
}

export interface HomeEditorialData {
  badge: string;
  title: string;
  description: string;
  quote: string;
  btn_text: string;
  btn_url: string;
  /** URL absolue résolue côté serveur */
  image_url: string | null;
  badge_detail_title: string;
  badge_detail_text: string;
}

export interface HomePromoData {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  btn_text: string;
  btn_url: string;
  /** URL absolue résolue côté serveur */
  image_url: string | null;
}

export interface HomeSiteSettings {
  name: string;
  logo_url: string | null;
  favicon_url: string | null;
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
}

export interface HomeData {
  hero: HomeHeroData;
  editorial: HomeEditorialData;
  promo: HomePromoData;
  site: HomeSiteSettings;
}

export interface SiteSettings {
  site_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_email?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  hours?: string;
  currency?: string;
  shipping_fee?: number | string;
  free_shipping_threshold?: number | string;
  meta_title?: string;
  meta_description?: string;
  site_logo?: string | null;
  site_favicon?: string | null;
  site_logo_url?: string | null;
  site_favicon_url?: string | null;
  hero_eyebrow?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  hero_primary_btn_text?: string;
  hero_primary_btn_url?: string;
  hero_secondary_btn_text?: string;
  hero_secondary_btn_url?: string;
  hero_image?: string | null;
  hero_image_url?: string | null;
  hero_is_active?: string | boolean;
  editorial_badge?: string;
  editorial_title?: string;
  editorial_description?: string;
  editorial_quote?: string;
  editorial_btn_text?: string;
  editorial_btn_url?: string;
  editorial_image?: string | null;
  editorial_image_url?: string | null;
  editorial_badge_detail_title?: string;
  editorial_badge_detail_text?: string;
  promo_badge?: string;
  promo_title?: string;
  promo_subtitle?: string;
  promo_description?: string;
  promo_btn_text?: string;
  promo_btn_url?: string;
  promo_image?: string | null;
  promo_image_url?: string | null;
  [key: string]: unknown;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const homeService = {
  /**
   * GET /api/home
   * Retourne toutes les données dynamiques de la page d'accueil.
   */
  async getHomeData(): Promise<ApiResponse<HomeData>> {
    return apiClient.get('/home');
  },

  /**
   * GET /api/settings
   * Retourne les paramètres publics du site (pour SEO, header, footer, etc.).
   */
  async getPublicSettings(): Promise<ApiResponse<SiteSettings>> {
    return apiClient.get('/settings');
  },
};
