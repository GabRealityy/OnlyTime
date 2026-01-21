/*
  Date helpers for "current month" calculations.
*/

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function monthKeyFromDate(date: Date): string {
  // YYYY-MM, used to segment expenses per month in localStorage.
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  return `${y}-${pad2(m)}`
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function daysInMonth(date: Date): number {
  // Day 0 of next month is last day of current month.
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function dayOfMonth(date: Date): number {
  return date.getDate()
}

export function monthLabel(date: Date): string {
  // Example: "January 2026".
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function isoDateLocal(date: Date): string {
  // Local "YYYY-MM-DD" (good for <input type="date">).
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}-${pad2(m)}-${pad2(d)}`
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}
