import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and meta description.
 * @param {string} title - Page specific title segment
 * @param {string} description - Page specific description
 */
export default function useDocumentTitle(title, description) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Hafrose — Haute Maroquinerie d'Exception`;
    } else {
      document.title = 'Hafrose — Haute Maroquinerie d\'Exception';
    }

    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [title, description]);
}
