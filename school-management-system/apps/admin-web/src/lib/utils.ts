import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(new Date(date))
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  const statusMap: Record<string, any> = {
    'taslak': 'secondary',
    'aktif': 'success',
    'gecikmiş': 'destructive',
    'ödendi': 'success',
    'iptal': 'destructive',
    'bekleyen': 'warning'
  }
  
  return statusMap[status.toLowerCase()] || 'default'
}