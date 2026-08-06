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
}

export const productsService = {
  async getProducts(params?: ProductQueryFilters): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(slug));
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
  },
};
