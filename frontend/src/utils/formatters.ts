/**
 * formatPrice
 * Formats a numeric price value using the Intl.NumberFormat API.
 *
 * HAFROSE official currency: MAD (Dirham Marocain)
 *
 * @param amount   - numeric price (in decimal, e.g. 129.90)
 * @param currency - ISO 4217 currency code (default: 'MAD')
 * @param locale   - BCP 47 locale string (default: 'fr-MA')
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency = 'MAD',
  locale = 'fr-MA'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  const validNum = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(validNum);
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
 * Constructs an absolute URL for media file paths coming from Laravel Storage,
 * Laravel public directory, or static asset paths.
 * Falls back gracefully to a placeholder when the path is null, undefined, or empty.
 */
export function getImageUrl(
  filePath: string | null | undefined,
  fallback = 'assets/images/placeholder.svg'
): string {
  if (!filePath || typeof filePath !== 'string' || !filePath.trim()) {
    if (filePath === fallback) {
      const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
      const serverUrl = storageUrl.replace(/\/storage\/?$/, '');
      return `${serverUrl}/assets/images/placeholder.svg`;
    }
    return getImageUrl(fallback);
  }

  const trimmed = filePath.trim();

  // Return full URLs and data URIs as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Base server URL (e.g. http://localhost:8000)
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
  const serverUrl = storageUrl.replace(/\/storage\/?$/, '');

  // Strip leading slashes
  const cleanPath = trimmed.replace(/^\/+/, '');

  // 1. Direct storage path (e.g. storage/products/...)
  if (cleanPath.startsWith('storage/')) {
    return `${serverUrl}/${cleanPath}`;
  }

  // 2. Direct public images path (e.g. images/products/sacs/...)
  if (cleanPath.startsWith('images/')) {
    return `${serverUrl}/${cleanPath}`;
  }

  // 3. Direct public assets path (e.g. assets/images/...)
  if (cleanPath.startsWith('assets/')) {
    return `${serverUrl}/${cleanPath}`;
  }

  // 4. Relative storage paths (e.g. products/..., categories/..., galleries/..., uploads/...)
  if (
    cleanPath.startsWith('products/') ||
    cleanPath.startsWith('categories/') ||
    cleanPath.startsWith('galleries/') ||
    cleanPath.startsWith('uploads/')
  ) {
    return `${serverUrl}/storage/${cleanPath}`;
  }

  // Default: append cleanPath to storage URL
  return `${serverUrl}/storage/${cleanPath}`;
}

