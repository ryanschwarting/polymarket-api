import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes efficiently.
 * Uses clsx for conditional class joining and tailwind-merge to handle conflicting Tailwind classes.
 *
 * @param inputs - Class values to be merged (strings, objects, arrays, etc.)
 * @returns A string of merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
