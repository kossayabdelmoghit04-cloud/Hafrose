import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Product, Category } from '../types/models';
import { ApiResponse, ApiPaginatedResponse } from '../types/api';

export interface ProductQueryFilters {
  category?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'latest' | 'featured';
  page?: number;
  per_page?: number;
  is_featured?: boolean;
  is_new?: boolean;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
}

export const productsService = {
  async getProducts(params?: ProductQueryFilters): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(slug));
  },

  async getFeaturedProducts(limit = 8): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { is_featured: true, per_page: limit, sort: 'featured' },
    });
  },

  async getNewArrivals(limit = 6): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { is_new: true, per_page: limit, sort: 'latest' },
    });
  },

  async getRelatedProducts(slug: string, limit = 4): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(`${API_ENDPOINTS.PRODUCTS.DETAILS(slug)}/related`, {
      params: { per_page: limit },
    });
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
  },
};
