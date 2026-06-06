import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAge(age: number): string {
  const rounded = Math.round(age * 100) / 100
  if (rounded < 1) {
    return `${Math.round(rounded * 12)}月龄`
  }
  const years = Math.floor(rounded)
  const months = Math.round((rounded - years) * 12)
  if (months > 0) {
    return `${years}岁${months}月龄`
  }
  return `${years}岁`
}
