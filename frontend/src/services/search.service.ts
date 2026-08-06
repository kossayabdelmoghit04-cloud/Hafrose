import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Product } from '../types/models';
import { ApiResponse } from '../types/api';

export const searchService = {
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params: { search: query } });
  },

  getPopularSuggestions(): string[] {
    return ['Robe de Soirée', 'Sac Cuir', 'Escarpins Velours', 'Collier Or', 'Foulard Soie', 'Blazer Crème'];
  },
};
