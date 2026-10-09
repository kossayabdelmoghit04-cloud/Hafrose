const nonNegativeNumber = (value: number): number => (
  Number.isFinite(value) ? Math.max(0, value) : 0
);

/**
 * Frontend estimate only. The backend remains the source of truth.
 * A zero free-shipping threshold means free shipping is disabled.
 */
export const calculateEstimatedShipping = (
  subtotal: number,
  configuredShippingFee: number,
  configuredFreeShippingThreshold: number
): number => {
  const safeSubtotal = nonNegativeNumber(subtotal);
  const shippingFee = nonNegativeNumber(configuredShippingFee);
  const freeShippingThreshold = nonNegativeNumber(configuredFreeShippingThreshold);

  if (safeSubtotal === 0) {
    return 0;
  }

  return freeShippingThreshold > 0 && safeSubtotal >= freeShippingThreshold
    ? 0
    : shippingFee;
};
