import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAge(ageMonths: number): string {
  if (ageMonths < 12) {
    return `${ageMonths}月龄`
  }
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  if (months > 0) {
    return `${years}岁${months}月龄`
  }
  return `${years}岁`
}
