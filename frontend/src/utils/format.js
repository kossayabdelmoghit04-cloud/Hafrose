/**
 * Formats a number to a standard Euro price string.
 * @param {number} amount - The price amount
 * @returns {string} Formatted price (e.g. "1 250,00 €")
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0,00 €';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
