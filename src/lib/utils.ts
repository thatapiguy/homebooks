import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatYear(year: number | null | undefined): string {
  return year ? String(year) : 'Unknown year'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export const STATUS_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  read: 'Read',
}

export const STATUS_COLORS: Record<string, string> = {
  want_to_read: 'bg-slate-100 text-slate-700',
  reading: 'bg-blue-100 text-blue-700',
  read: 'bg-green-100 text-green-700',
}
