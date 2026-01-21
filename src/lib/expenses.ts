/*
  Expenses model (stored per-month in localStorage).

  Storage scheme:
  - Key: onlytime:v1:expenses:YYYY-MM
  - Value: array of Expense
*/

import { loadFromStorage, saveToStorage, storageKeys } from './storage'

export const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Fun',
  'Subscriptions',
  'Other',
] as const

export type ExpenseCategory = (typeof expenseCategories)[number]

/**
 * Quick-Add Preset: Häufige Ausgaben mit einem Klick erfassen
 */
export type QuickAddPreset = {
  id: string
  title: string
  amountCHF: number
  category: ExpenseCategory | string // string für custom categories
  emoji?: string
}

/**
 * Benutzerdefinierte Kategorie mit optionaler Farbe/Icon
 */
export type CustomCategory = {
  id: string
  name: string
  color?: string
  emoji?: string
}

/**
 * Budget pro Kategorie (CHF pro Monat)
 */
export type CategoryBudget = {
  categoryId: string
  monthlyBudgetCHF: number
}

export type Expense = {
  id: string
  // YYYY-MM-DD (local date, matches <input type="date">)
  date: string
  amountCHF: number
  title: string
  category: ExpenseCategory
  createdAt: number
  // Optional: berechnete Stundenanzahl (wird dynamisch aus amountCHF / hourlyRate berechnet)
  amountHours?: number
}

export function monthKeyFromIsoDate(isoDate: string): string {
  // isoDate expected: YYYY-MM-DD
  return isoDate.slice(0, 7)
}

export function loadExpensesForMonth(monthKey: string): Expense[] {
  const raw = loadFromStorage<unknown>(storageKeys.expensesByMonth(monthKey))
  if (!Array.isArray(raw)) return []

  const parsed: Expense[] = []
  for (const item of raw) {
    const exp = normalizeExpense(item)
    if (exp) parsed.push(exp)
  }

  // newest first in UI
  parsed.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  return parsed
}

export function saveExpensesForMonth(monthKey: string, expenses: Expense[]): void {
  saveToStorage(storageKeys.expensesByMonth(monthKey), expenses)
}

export function addExpense(monthKey: string, expense: Omit<Expense, 'id' | 'createdAt'>): Expense[] {
  const existing = loadExpensesForMonth(monthKey)
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  const next: Expense = {
    ...expense,
    id,
    createdAt: Date.now(),
  }
  const updated = [next, ...existing]
  saveExpensesForMonth(monthKey, updated)
  return updated
}

export function deleteExpense(monthKey: string, id: string): Expense[] {
  const existing = loadExpensesForMonth(monthKey)
  const updated = existing.filter((e) => e.id !== id)
  saveExpensesForMonth(monthKey, updated)
  return updated
}

function normalizeExpense(input: unknown): Expense | undefined {
  if (typeof input !== 'object' || input === null) return undefined
  const obj = input as Record<string, unknown>

  const id = typeof obj.id === 'string' ? obj.id : undefined
  const date = typeof obj.date === 'string' ? obj.date : undefined
  const title = typeof obj.title === 'string' ? obj.title : ''
  const category = (typeof obj.category === 'string' ? obj.category : 'Other') as ExpenseCategory
  const amountCHF = toNumber(obj.amountCHF)
  const createdAt = typeof obj.createdAt === 'number' && Number.isFinite(obj.createdAt) ? obj.createdAt : Date.now()

  if (!id || !date) return undefined
  if (!expenseCategories.includes(category)) return undefined
  if (!Number.isFinite(amountCHF)) return undefined

  return {
    id,
    date,
    title,
    category,
    amountCHF: Math.max(0, amountCHF),
    createdAt,
  }
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return n
  }
  return NaN
}
