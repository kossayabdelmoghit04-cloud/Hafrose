/**
 * HAFROSE — Input Sanitizer Utilities (Phase 5.6)
 * XSS prevention and input sanitization helpers.
 */

/**
 * Strips HTML tags from a string to prevent XSS injection via user input.
 * @param {string} input
 * @returns {string}
 */
export function stripHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a user-provided string for display in the DOM (light variant).
 * Trims whitespace and removes control characters.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

/**
 * Validates and sanitizes an email address.
 * Returns null if invalid.
 * @param {string} email
 * @returns {string|null}
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
  return emailRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitizes a URL string — allows only http/https protocols.
 * Returns null if the URL is unsafe.
 * @param {string} url
 * @returns {string|null}
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Sanitizes a numeric value — returns the number or null.
 * @param {*} value
 * @param {{ min?: number, max?: number }} options
 * @returns {number|null}
 */
export function sanitizeNumber(value, { min, max } = {}) {
  const num = Number(value);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}
