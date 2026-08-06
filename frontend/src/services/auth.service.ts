import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';
import { User } from '../types/models';
import { ApiResponse } from '../types/api';

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  current_password?: string;
  new_password?: string;
  password_confirmation?: string;
}

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

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return apiClient.put(API_ENDPOINTS.AUTH.PROFILE, payload);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<void>> {
    return apiClient.put('/customer/change-password', payload);
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post('/customer/forgot-password', { email });
  },

  async resetPassword(payload: { email: string; token: string; password?: string; password_confirmation?: string }): Promise<ApiResponse<void>> {
    return apiClient.post('/customer/reset-password', payload);
  },
};
