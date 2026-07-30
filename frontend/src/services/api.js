import axios from 'axios';
import { logger } from '../utils/logger';
import { requestDeduplicator } from '../lib/requestDeduplicator';
import { abortManager } from '../lib/abortManager';

/**
 * HAFROSE — Enterprise Axios Client (Phase 1)
 * 
 * Features:
 * - Exponential backoff retry with jitter
 * - Safe HTTP Method Whitelisting (GET, HEAD, OPTIONS)
 * - Strict HTTP Status Code Retry Policies (429, 500, 502, 503, 504, Network/Timeout)
 * - In-flight Request Deduplication
 * - AbortController Signal Integration
 * - Sanitized Development & Production Logging
 */

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 300;

// Safe HTTP methods eligible for automatic retry
const RETRYABLE_METHODS = ['get', 'head', 'options'];

// HTTP status codes eligible for automatic retry
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Calculates exponential backoff delay with random jitter
 */
function getBackoffDelay(retryCount, retryAfterHeader) {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  const jitter = Math.random() * 200;
  return Math.min(delay + jitter, 5000);
}

/**
 * Determines if a request error is eligible for retry
 */
function isRetryable(error, config) {
  const method = (config.method || 'get').toLowerCase();
  
  // Custom explicit override if request marked idempotent
  if (config._allowRetry) return true;

  // Never retry non-safe methods (POST, PUT, DELETE, Uploads) by default
  if (!RETRYABLE_METHODS.includes(method)) return false;

  // Network error or timeout (no response received)
  if (!error.response) return true;

  // Specific status code policies
  const status = error.response.status;
  return RETRYABLE_STATUS_CODES.includes(status);
}

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    config._startTime = Date.now();

    // Attach Bearer Token if present
    const customerToken = localStorage.getItem('hafrose_customer_token') || localStorage.getItem('customer_token');
    const adminToken = localStorage.getItem('admin_token');
    const token = customerToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach custom request key for tracking/aborting if provided
    if (config.requestKey) {
      config.signal = abortManager.createSignal(config.requestKey);
    }

    logger.request(config);
    return config;
  },
  (error) => {
    logger.error('Request Interceptor Error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config._startTime || Date.now());
    logger.response(response, duration);

    // Clean up request key if used
    if (response.config.requestKey) {
      abortManager.remove(response.config.requestKey);
    }

    return response.data;
  },
  async (error) => {
    const config = error.config;

    // Handle Canceled / Aborted Requests cleanly
    if (axios.isCancel(error)) {
      logger.warn('HTTP Request Cancelled', { url: config?.url, reason: error.message });
      const cancelError = new Error('Request cancelled by user or navigation');
      cancelError.isCanceled = true;
      cancelError.status = 499; // Client Closed Request
      return Promise.reject(cancelError);
    }

    // Clean up request key
    if (config?.requestKey) {
      abortManager.remove(config.requestKey);
    }

    // Automatic Exponential Backoff Retry Logic
    if (config && isRetryable(error, config)) {
      config._retryCount = (config._retryCount || 0) + 1;

      if (config._retryCount <= MAX_RETRIES) {
        const retryAfter = error.response?.headers?.['retry-after'];
        const delay = getBackoffDelay(config._retryCount - 1, retryAfter);

        logger.warn(
          `Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${Math.round(delay)}ms: ${config.url}`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Standardized Error Parsing
    let errorMessage = 'Une erreur réseau est survenue. Veuillez réessayer.';
    let validationErrors = null;
    const status = error.response?.status || 500;

    if (error.response) {
      const { data } = error.response;
      errorMessage = data?.message || errorMessage;
      validationErrors = data?.errors || null;

      switch (status) {
        case 400:
          logger.warn('Bad Request (400)', { url: config?.url, message: errorMessage });
          break;
        case 401:
          logger.warn('Unauthorized (401) — Session expired or invalid token', { url: config?.url });
          break;
        case 403:
          logger.warn('Forbidden (403)', { url: config?.url });
          break;
        case 404:
          logger.warn('Not Found (404)', { url: config?.url });
          break;
        case 422:
          logger.warn('Validation Error (422)', { errors: validationErrors });
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez patienter un instant.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Le serveur MAISON HAFROSE rencontre une indisponibilité temporaire.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      errorMessage = 'Impossible de contacter le serveur HAFROSE. Veuillez vérifier votre connexion.';
    }

    const apiError = new Error(errorMessage);
    apiError.status = status;
    apiError.errors = validationErrors;
    apiError.originalError = error;
    apiError.isNetworkError = !error.response;

    logger.error('API Error Response', {
      url: config?.url,
      status,
      message: errorMessage,
    });

    return Promise.reject(apiError);
  }
);

// Wrapper with Automatic Request Deduplication for GET requests
const deduplicatedApi = {
  ...api,
  get: (url, config = {}) => {
    // If explicitly marked to bypass deduplication, use raw call
    if (config.skipDedupe) {
      return api.get(url, config);
    }
    const key = requestDeduplicator.generateKey({ method: 'get', url, params: config.params });
    return requestDeduplicator.dedupe(key, () => api.get(url, config));
  },
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default deduplicatedApi;
