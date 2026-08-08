import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Product } from '../types/models';
import { ApiResponse, ApiPaginatedResponse } from '../types/api';

export const searchService = {
  async searchProducts(query: string, perPage = 12): Promise<ApiPaginatedResponse<Product>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query, search: query, per_page: perPage } });
  },

  async autocomplete(query: string): Promise<ApiResponse<Product[]>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.AUTOCOMPLETE, { params: { q: query } });
  },

  getPopularSuggestions(): string[] {
    return ['Robe de Soirée', 'Sac Cuir', 'Escarpins Velours', 'Collier Or', 'Foulard Soie', 'Blazer Crème'];
  },
};

