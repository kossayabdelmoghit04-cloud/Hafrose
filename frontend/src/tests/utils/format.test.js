import { describe, it, expect } from 'vitest';
import { formatPrice } from '../../utils/format';

describe('formatPrice', () => {
  it('formats a standard price in euros', () => {
    const result = formatPrice(1250);
    expect(result).toContain('1');
    expect(result).toContain('250');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toContain('0');
  });

  it('returns fallback for undefined', () => {
    expect(formatPrice(undefined)).toBe('0,00 €');
  });

  it('returns fallback for null', () => {
    expect(formatPrice(null)).toBe('0,00 €');
  });

  it('returns fallback for NaN', () => {
    expect(formatPrice(NaN)).toBe('0,00 €');
  });

  it('handles decimal amounts', () => {
    const result = formatPrice(99.99);
    expect(result).toContain('99');
    expect(result).toContain('€');
  });

  it('handles large amounts', () => {
    const result = formatPrice(10000);
    expect(result).toContain('€');
  });
});
