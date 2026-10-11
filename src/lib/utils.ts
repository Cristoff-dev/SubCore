import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely without style conflicts.
 * Used extensively by Shadcn UI and custom components.
 * 
 * @param inputs - Array of class values, objects, or strings
 * @returns A merged string of Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}