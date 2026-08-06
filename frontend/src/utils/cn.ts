import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — Conditional class name composer for Tailwind CSS.
 * Merges clsx conditionals with tailwind-merge to prevent duplicate/conflicting classes.
 *
 * Usage: cn('base-class', condition && 'conditional-class', 'override-class')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
