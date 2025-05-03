import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>{}]/g, '');
};