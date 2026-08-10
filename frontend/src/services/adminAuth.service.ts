import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../types/api';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const adminAuthService = {
  async login(payload: AdminLoginPayload): Promise<ApiResponse<AdminAuthResponse>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, payload);
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.LOGOUT);
  },

  async me(): Promise<ApiResponse<AdminAuthResponse['user'] & { permissions: string[] }>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.ME);
  },
};
