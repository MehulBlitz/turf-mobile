import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine multiple class name inputs into a single class string with Tailwind conflicts resolved.
 * @param {...any} inputs - Class name inputs (strings, arrays, objects, etc.) to be merged.
 * @returns {string} The resulting merged class string with conflicting Tailwind classes resolved.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
