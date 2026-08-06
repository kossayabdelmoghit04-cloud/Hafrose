import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';
import { User } from '../types/models';
import { ApiResponse } from '../types/api';

export const authService = {
  async getCsrfCookie(): Promise<void> {
    await apiClient.get(API_ENDPOINTS.AUTH.SANCTUM_CSRF);
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
  },
};
