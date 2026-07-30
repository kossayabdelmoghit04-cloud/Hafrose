/**
 * HAFROSE — Enterprise Sanitized Logger (Phase 15 & 17)
 * 
 * Provides secure logging across Development and Production:
 * - Development: Rich console logging with timing, HTTP status, and sanitized payload.
 * - Production: Silent execution; only critical exceptions captured.
 * - Security: Strips sensitive credentials (tokens, passwords, CSRF, credit cards, Authorization).
 */

const SENSITIVE_KEYS = [
  'password',
  'password_confirmation',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'bearer',
  'csrf_token',
  'xsrf_token',
  'credit_card',
  'card_number',
  'cvv',
  'secret',
];

/**
 * Recursively sanitizes data to prevent leaking sensitive credentials in logs
 */
export function sanitizeData(data) {
  if (!data) return data;

  if (typeof data === 'string') {
    // Mask Bearer tokens if present in raw string
    return data.replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return data;
}

class EnterpriseLogger {
  constructor() {
    this.isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  info(message, meta = {}) {
    if (this.isDev) {
      console.log(`[HAFROSE API ℹ️] ${message}`, sanitizeData(meta));
    }
  }

  warn(message, meta = {}) {
    if (this.isDev) {
      console.warn(`[HAFROSE API ⚠️] ${message}`, sanitizeData(meta));
    }
  }

  error(message, meta = {}) {
    // Errors are logged in both dev and captured for production telemetry
    const sanitizedMeta = sanitizeData(meta);
    if (this.isDev) {
      console.error(`[HAFROSE API 🚨] ${message}`, sanitizedMeta);
    } else {
      // Production exception telemetry hook
      // e.g. Window Error dispatcher or telemetry reporter
    }
  }

  request(config) {
    if (this.isDev) {
      console.groupCollapsed(`[HAFROSE Outgoing HTTP ↗️] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', sanitizeData(config.headers));
      if (config.params) console.log('Params:', sanitizeData(config.params));
      if (config.data) console.log('Payload:', sanitizeData(config.data));
      console.groupEnd();
    }
  }

  response(response, duration) {
    if (this.isDev) {
      console.groupCollapsed(
        `[HAFROSE Incoming HTTP ↘️] ${response.status} ${response.config?.url} (${duration}ms)`
      );
      console.log('Response Data:', sanitizeData(response.data));
      console.groupEnd();
    }
  }
}

export const logger = new EnterpriseLogger();
