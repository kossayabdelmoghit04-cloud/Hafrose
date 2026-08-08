import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { UserAddress } from '../types/models';
import { ApiResponse } from '../types/api';

export interface CreateAddressPayload {
  title?: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}

export const addressesService = {
  async getAddresses(): Promise<ApiResponse<UserAddress[]>> {
    return apiClient.get(API_ENDPOINTS.ADDRESSES.LIST);
  },

  async addAddress(payload: CreateAddressPayload): Promise<ApiResponse<UserAddress>> {
    return apiClient.post(API_ENDPOINTS.ADDRESSES.CREATE, payload);
  },

  async updateAddress(id: number, payload: UpdateAddressPayload): Promise<ApiResponse<UserAddress>> {
    return apiClient.put(API_ENDPOINTS.ADDRESSES.UPDATE(id), payload);
  },

  async deleteAddress(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.ADDRESSES.DELETE(id));
  },

  async setDefaultAddress(id: number): Promise<ApiResponse<UserAddress>> {
    return apiClient.patch(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id));
  },
};

