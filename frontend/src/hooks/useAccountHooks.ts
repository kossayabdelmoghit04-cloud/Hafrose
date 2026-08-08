import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, CreateOrderPayload } from '../services/orders.service';
import { addressesService, CreateAddressPayload, UpdateAddressPayload } from '../services/addresses.service';
import { wishlistService } from '../services/wishlist.service';
import { useAuthStore } from '../stores/useAuthStore';
import { useWishlistStore } from '../stores/useWishlistStore';

export const ORDERS_QUERY_KEY = ['account', 'orders'];
export const ADDRESSES_QUERY_KEY = ['account', 'addresses'];
export const WISHLIST_QUERY_KEY = ['account', 'wishlist'];

export function useOrders() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const response = await ordersService.getOrders();
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useOrderDetail(id: number) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await ordersService.getOrderById(id);
      return response.data;
    },
    enabled: Boolean(token) && !isNaN(id),
  });
}

export function useAddresses() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const response = await addressesService.getAddresses();
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      const response = await addressesService.addAddress(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateAddressPayload }) => {
      const response = await addressesService.updateAddress(id, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await addressesService.deleteAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await addressesService.setDefaultAddress(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useWishlistQuery() {
  const token = useAuthStore((state) => state.token);
  const setItems = useWishlistStore((state) => state.setItems);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const response = await wishlistService.getWishlist();
      setItems(response.data);
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await ordersService.createOrder(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
