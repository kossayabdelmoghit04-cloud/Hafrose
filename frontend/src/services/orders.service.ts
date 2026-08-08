import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Order } from '../types/models';
import { ApiResponse } from '../types/api';

export interface CreateOrderPayload {
  customer?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  shipping_amount?: number;
  shipping_method?: string;
  payment_method?: 'card' | 'paypal' | 'cod' | string;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  items: {
    product_id: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];
}

function formatOrderPayload(payload: CreateOrderPayload) {
  const customerName =
    payload.customer ||
    `${payload.shipping_address?.first_name || ''} ${payload.shipping_address?.last_name || ''}`.trim() ||
    'Client HAFROSE';

  const phone = payload.phone || payload.shipping_address?.phone || '';
  const address = payload.address || payload.shipping_address?.address || '';
  const city = payload.city || payload.shipping_address?.city || '';
  const postalCode = payload.postal_code || payload.shipping_address?.postal_code || '';
  const country = payload.country || payload.shipping_address?.country || 'France';

  return {
    customer: customerName,
    phone,
    address,
    city,
    postal_code: postalCode,
    country,
    shipping_amount: payload.shipping_amount ?? 0,
    shipping_method: payload.shipping_method ?? 'express',
    payment_method: payload.payment_method ?? 'card',
    shipping_address: {
      name: customerName,
      address,
      city,
      postal_code: postalCode,
      country,
      phone,
    },
    items: payload.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
  };
}

export const ordersService = {
  async getOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.MY_ORDERS);
  },

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.MY_ORDER_DETAILS(id));
  },

  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    return apiClient.post(API_ENDPOINTS.ORDERS.CREATE, formatOrderPayload(payload));
  },
};

