import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export type BookingStatus =
  | 'INITIATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | (string & {})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getBookingStatusColor(status: BookingStatus): string {
  const map: Record<string, string> = {
    INITIATED: 'bg-amber-100 text-amber-800 border-amber-200',
    PAYMENT_PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    EXPIRED: 'bg-stone-200 text-stone-700 border-stone-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }
  return map[status] || 'bg-stone-100 text-stone-700'
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const map: Record<string, string> = {
    INITIATED: 'Initiated',
    PAYMENT_PENDING: 'Payment Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  }
  return map[status] || status
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}