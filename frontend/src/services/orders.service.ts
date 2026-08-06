import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Order } from '../types/models';
import { ApiResponse, ApiPaginatedResponse } from '../types/api';

export interface CreateOrderPayload {
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  payment_method: 'card' | 'paypal' | 'cod';
  items: {
    product_id: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];
}

export const ordersService = {
  async getOrders(): Promise<ApiPaginatedResponse<Order>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.LIST);
  },

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.DETAILS(id));
  },

  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    return apiClient.post(API_ENDPOINTS.ORDERS.CREATE, payload);
  },
};
