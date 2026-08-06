/**
 * formatPrice
 * Formats a numeric price value using the Intl.NumberFormat API.
 *
 * @param amount   - numeric price (in decimal, e.g. 129.90)
 * @param currency - ISO 4217 currency code (default: 'EUR')
 * @param locale   - BCP 47 locale string (default: 'fr-FR')
 */
export function formatPrice(
  amount: number,
  currency = 'EUR',
  locale = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * formatDate
 * Formats an ISO date string to a human-readable localized format.
 */
export function formatDate(
  isoString: string,
  locale = 'fr-FR',
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(isoString));
}

/**
 * slugify
 * Converts a plain string into a URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * truncateText
 * Truncates a string to a max length and appends an ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * getImageUrl
 * Constructs an absolute URL for a media file path from Laravel Storage.
 * Falls back to a placeholder when the path is null or undefined.
 */
export function getImageUrl(
  filePath: string | null | undefined,
  fallback = '/assets/images/placeholder.webp'
): string {
  if (!filePath) return fallback;
  if (filePath.startsWith('http')) return filePath;
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
  return `${baseUrl}/${filePath}`;
}
