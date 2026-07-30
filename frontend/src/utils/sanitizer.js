/**
 * HAFROSE — Frontend Trusted Types & Input Sanitizer Architecture (Phase 6.5)
 *
 * Provides XSS prevention, HTML sanitization, Trusted Types policy creation,
 * and safe rendering for dynamic strings, search terms, and user inputs.
 */

// Trusted Types Policy Initializer
let hafrosePolicy = null;

if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    hafrosePolicy = window.trustedTypes.createPolicy('hafrosePolicy', {
      createHTML: (string) => sanitizeHtmlString(string),
      createScript: (string) => string,
      createScriptURL: (string) => string,
    });
  } catch (e) {
    // Policy already created or unsupported
  }
}

/**
 * Basic HTML string escaping
 */

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes arbitrary user-generated strings against XSS vector execution
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  // Strip script tags, event handlers, and javascript: pseudo-protocols
  let sanitized = input
    .replace(/<script\b[^>]*>(.*?)<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '');
  return escapeHtml(sanitized.trim());
}

/**
 * Internal HTML sanitizer implementation
 */
function sanitizeHtmlString(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^>]*>(.*?)<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>(.*?)<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Safe JSON-LD string builder to prevent script tag breakout
 */
export function sanitizeJsonLd(jsonObject) {
  const jsonString = JSON.stringify(jsonObject);
  return jsonString.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

/**
 * Trusted Types Policy Exporter
 */
export const sanitizer = {
  escapeHtml,
  sanitizeString,
  sanitizeJsonLd,
  createTrustedHtml: (rawHtml) => {
    const clean = sanitizeHtmlString(rawHtml);
    if (hafrosePolicy) {
      return hafrosePolicy.createHTML(clean);
    }
    return clean;
  },
};

export default sanitizer;
