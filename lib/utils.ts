import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

export function formatCrc(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded).toString();
  const withThousands = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `₡${rounded < 0 ? "-" : ""}${withThousands}`;
}
