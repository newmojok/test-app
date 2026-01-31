import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: value >= 1e12 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1e12 ? 1 : 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

// Format date as quarterly label (Q1 '24, Q2, Q3, Q4, Q1 '25, etc.)
export function formatDateQuarterly(date: Date | string): string {
  const d = new Date(date)
  const month = d.getMonth()
  const year = d.getFullYear()
  const yearShort = String(year).slice(2)

  if (month === 0) return `Q1 '${yearShort}`
  if (month === 3) return 'Q2'
  if (month === 6) return 'Q3'
  if (month === 9) return 'Q4'
  return ''
}

// Check if a date is at a quarter boundary (Jan, Apr, Jul, Oct)
export function isQuarterStart(date: Date | string): boolean {
  const month = new Date(date).getMonth()
  return month === 0 || month === 3 || month === 6 || month === 9
}

// Format date as year only (for Jan 1st) or empty
export function formatDateYearly(date: Date | string): string {
  const d = new Date(date)
  const month = d.getMonth()
  if (month === 0) return String(d.getFullYear())
  return ''
}

export function calculateRoC(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}
