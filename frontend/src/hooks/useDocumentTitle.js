import useSEO from './useSEO';

/**
 * Backward-compatible hook. Delegates to useSEO.
 * All existing pages continue to work without modification.
 *
 * @param {string} title       - Page-specific title segment
 * @param {string} description - Meta description
 */
export default function useDocumentTitle(title, description) {
  useSEO({ title, description });
}
