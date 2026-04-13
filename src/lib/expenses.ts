/*
  Low-level expense storage (localStorage, per-month buckets).
  Access from app code only via src/lib/expenseRepo.ts — this module
  is an implementation detail of the repository.

  Storage scheme:
  - Key: onlytime:v1:expenses:YYYY-MM
  - Value: array of Expense
*/

import { loadFromStorage, saveToStorage, storageKeys } from './storage'
import type { Expense } from './expenseTypes'

export function loadExpensesForMonth(monthKey: string): Expense[] {
  const raw = loadFromStorage<unknown>(storageKeys.expensesByMonth(monthKey))
  if (!Array.isArray(raw)) return []

  const parsed: Expense[] = []
  for (const item of raw) {
    const exp = normalizeExpense(item)
    if (exp) parsed.push(exp)
  }

  parsed.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  return parsed
}

export function loadExpensesForRange(startMonthKey: string, endMonthKey: string): Expense[] {
  const allExpenses: Expense[] = []
  const [startYear, startMonth] = startMonthKey.split('-').map(Number)
  const [endYear, endMonth] = endMonthKey.split('-').map(Number)

  let currentYear = startYear
  let currentMonth = startMonth

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
    allExpenses.push(...loadExpensesForMonth(monthKey))
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  allExpenses.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  return allExpenses
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
  const category = typeof obj.category === 'string' && obj.category.trim() ? obj.category.trim() : 'Sonstiges'
  const amountCHF = toNumber(obj.amountCHF)
  const createdAt = typeof obj.createdAt === 'number' && Number.isFinite(obj.createdAt) ? obj.createdAt : Date.now()

  if (!id || !date) return undefined
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
