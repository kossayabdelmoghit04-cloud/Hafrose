/**
 * HAFROSE Frontend — Validation Utilities
 *
 * Lightweight validators used in form logic and input components.
 * These are pure functions with no side effects.
 */

export const validators = {
  /**
   * Returns true if the string is a valid email format.
   */
  isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },

  /**
   * Returns true if the string meets the minimum password requirements.
   * Mirrors Laravel's reset-password policy: >= 12 chars, uppercase, lowercase, number and symbol.
   */
  isStrongPassword(value: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(value);
  },

  /**
   * Returns true if the value is not empty (after trim).
   */
  isRequired(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  },

  /**
   * Returns true if value is within the given numeric range.
   */
  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },
};
