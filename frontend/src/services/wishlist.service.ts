import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { WishlistItem } from '../types/models';
import { ApiResponse } from '../types/api';

export const wishlistService = {
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    return apiClient.get(API_ENDPOINTS.WISHLIST.GET);
  },

  async addToWishlist(productId: number): Promise<ApiResponse<WishlistItem>> {
    return apiClient.post(API_ENDPOINTS.WISHLIST.ADD, { product_id: productId });
  },

  async removeFromWishlist(productId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
  },

  async checkWishlistStatus(productId: number): Promise<ApiResponse<{ is_favorite: boolean }>> {
    return apiClient.get(API_ENDPOINTS.WISHLIST.CHECK(productId));
  },
};

