/*
  Expense repository seam.

  Components, screens and hooks must not import from lib/expenses
  directly — they go through useExpenseRepo() which resolves to an
  ExpenseRepo implementation. The default implementation delegates
  to the per-month localStorage bucket in lib/expenses.

  Tests can swap in an in-memory repo via RepoProvider without
  touching production code.
*/

import {
  loadExpensesForMonth,
  loadExpensesForRange,
  addExpense,
  deleteExpense,
} from './expenses'
import type { Expense } from './expenseTypes'

export interface ExpenseRepo {
  listMonth(monthKey: string): Expense[]
  listRange(startMonthKey: string, endMonthKey: string): Expense[]
  add(monthKey: string, expense: Omit<Expense, 'id' | 'createdAt'>): Expense[]
  delete(monthKey: string, id: string): Expense[]
}

export const localStorageExpenseRepo: ExpenseRepo = {
  listMonth: loadExpensesForMonth,
  listRange: loadExpensesForRange,
  add: addExpense,
  delete: deleteExpense,
}
