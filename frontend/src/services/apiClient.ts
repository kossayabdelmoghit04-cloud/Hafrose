import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/api.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { ApiErrorResponse } from '../types/api';

/**
 * Singleton Axios Instance for HAFROSE API Communication
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Required for Laravel Sanctum cookie authentication
});

/**
 * Request Interceptor: Attach Bearer Token from Storage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor: Uniform Error Handling & 401 Session Revocation
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      // Trigger global session expiration event if needed
      window.dispatchEvent(new CustomEvent('hafrose:unauthorized'));
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
