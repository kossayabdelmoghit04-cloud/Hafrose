import apiClient from './apiClient';
import { UserAddress } from '../types/models';
import { ApiResponse } from '../types/api';

export interface CreateAddressPayload {
  address_name: string;
  recipient_name: string;
  street_address: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}

export const addressesService = {
  async getAddresses(): Promise<ApiResponse<UserAddress[]>> {
    return apiClient.get('/customer/addresses');
  },

  async addAddress(payload: CreateAddressPayload): Promise<ApiResponse<UserAddress>> {
    return apiClient.post('/customer/addresses', payload);
  },

  async updateAddress(id: number, payload: UpdateAddressPayload): Promise<ApiResponse<UserAddress>> {
    return apiClient.put(`/customer/addresses/${id}`, payload);
  },

  async deleteAddress(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/customer/addresses/${id}`);
  },

  async setDefaultAddress(id: number): Promise<ApiResponse<UserAddress>> {
    return apiClient.patch(`/customer/addresses/${id}/default`);
  },
};
