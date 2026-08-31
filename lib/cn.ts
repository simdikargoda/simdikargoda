import { clsx, type ClassValue } from "clsx";

/** Koşullu class adı birleştirici. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
