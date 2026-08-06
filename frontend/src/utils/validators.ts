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
   * Rule: >= 8 chars, at least 1 uppercase, 1 number.
   */
  isStrongPassword(value: string): boolean {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
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
