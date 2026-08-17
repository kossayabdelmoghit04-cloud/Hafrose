import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Product, Category } from '../types/models';
import { ApiResponse, ApiPaginatedResponse } from '../types/api';

export interface ProductQueryFilters {
  category?: string;
  search?: string;
  q?: string;
  sort?: 'price_asc' | 'price_desc' | 'latest' | 'featured' | 'name' | 'price' | 'created_at';
  sort_by?: 'name' | 'price' | 'created_at';
  direction?: 'asc' | 'desc' | 'ASC' | 'DESC';
  page?: number;
  per_page?: number;
  is_featured?: boolean | string;
  is_new?: boolean;
  on_sale?: boolean | string;
  price_min?: number;
  min_price?: number;
  price_max?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  color?: string;
  material?: string;
}

export const productsService = {
  async getProducts(params?: ProductQueryFilters): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(slug));
  },

  async getFeaturedProducts(limit = 8): Promise<ApiResponse<Product[]>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.POPULAR, {
      params: { limit },
    });
  },

  async getNewArrivals(limit = 6): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { sort: 'created_at', direction: 'desc', per_page: limit },
    });
  },

  async getRelatedProducts(idOrSlug: number | string, _limit = 4): Promise<ApiResponse<Product[]>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.RELATED(idOrSlug));
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
  },
};


