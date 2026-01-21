/*
  Money/time formatting + conversion helpers.
*/

export function formatCHF(value: number): string {
  // Keep it honest: no fancy rounding rules beyond 2 decimals.
  const rounded = Math.round(value * 100) / 100
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(rounded)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function toHoursMinutes(hoursFloat: number): { hours: number; minutes: number } {
  if (!Number.isFinite(hoursFloat)) return { hours: 0, minutes: 0 }
  const totalMinutes = Math.round(hoursFloat * 60)
  const hours = Math.trunc(totalMinutes / 60)
  const minutes = Math.abs(totalMinutes % 60)
  return { hours, minutes }
}

export function formatHoursMinutes(hoursFloat: number): string {
  const { hours, minutes } = toHoursMinutes(hoursFloat)
  const sign = hoursFloat < 0 ? '-' : ''
  const h = Math.abs(hours)
  return `${sign}${h}h ${minutes}m`
}
