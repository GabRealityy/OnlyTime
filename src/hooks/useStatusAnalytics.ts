import { useMemo } from 'react'
import type { Settings } from '../lib/settings'
import { effectiveNetMonthlyIncome } from '../lib/settings'
import { toHours } from '../lib/money'
import { loadExpensesForMonth, type Expense } from '../lib/expenses'
import type { DailyPoint } from '../components/LineChart'
import type { BudgetWarning } from '../components/status/BudgetWarnings'
import {
  buildMonthlyData,
  getMonthKeys,
  summarizeMonthlyData,
  timeRangeButtons,
  type TimeRange,
} from '../lib/rangeAnalytics'

function sumSpent(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + (Number.isFinite(e.amountCHF) ? e.amountCHF : 0), 0)
}

function dayOfIso(isoDate: string): number {
  const d = Number(isoDate.slice(8, 10))
  return Number.isFinite(d) ? d : 1
}

export type StatusAnalytics = {
  timeRangeLabel: string
  rangeStats: ReturnType<typeof summarizeMonthlyData>
  dailyPoints: DailyPoint[]
  rangePoints: DailyPoint[]
  allRangeExpenses: Expense[]
  budgetWarnings: BudgetWarning[]
  timeOverspent: boolean
}

export function useStatusAnalytics(input: {
  settings: Settings
  expenses: Expense[]
  hourly: number
  timeRange: TimeRange
  now: Date
  dim: number
  today: number
}): StatusAnalytics {
  const { settings, expenses, hourly, timeRange, now, dim, today } = input

  const rangeMonthlyData = useMemo(
    () => buildMonthlyData(settings, timeRange, now),
    [settings, timeRange, now],
  )

  const rangeStats = useMemo(
    () => summarizeMonthlyData(rangeMonthlyData, hourly),
    [rangeMonthlyData, hourly],
  )

  const timeRangeLabel = useMemo(
    () => timeRangeButtons.find((b) => b.id === timeRange)?.label ?? timeRange,
    [timeRange],
  )

  const earned = useMemo(() => {
    const monthly = effectiveNetMonthlyIncome(settings)
    if (monthly <= 0) return 0
    return (monthly / dim) * today
  }, [settings, dim, today])

  const spent = useMemo(() => sumSpent(expenses), [expenses])
  const earnedHours = toHours(earned, hourly)
  const spentHours = toHours(spent, hourly)
  const timeOverspent = spentHours > earnedHours

  const categorySpending = useMemo(() => {
    const spending = new Map<string, number>()
    for (const exp of expenses) {
      spending.set(exp.category, (spending.get(exp.category) || 0) + exp.amountCHF)
    }
    return spending
  }, [expenses])

  const budgetWarnings = useMemo<BudgetWarning[]>(() => {
    const warnings: BudgetWarning[] = []
    for (const budget of settings.categoryBudgets) {
      const warnSpent = categorySpending.get(budget.categoryId) || 0
      const budgetCHF = budget.monthlyBudgetCHF || (budget.monthlyBudgetHours ? budget.monthlyBudgetHours * hourly : 0)
      const percentage = budgetCHF > 0 ? (warnSpent / budgetCHF) * 100 : 0
      if (percentage >= 80) {
        warnings.push({
          category: budget.categoryId,
          spent: warnSpent,
          budgetCHF,
          budgetHours: budget.monthlyBudgetHours,
          percentage,
        })
      }
    }
    return warnings.sort((a, b) => b.percentage - a.percentage)
  }, [settings.categoryBudgets, categorySpending, hourly])

  const allRangeExpenses = useMemo(() => {
    if (timeRange === '1M') return [...expenses]
    const keys = getMonthKeys(timeRange, now)
    const all: Expense[] = []
    for (const key of keys) all.push(...loadExpensesForMonth(key))
    return all
  }, [timeRange, now, expenses])

  const dailyPoints = useMemo<DailyPoint[]>(() => {
    const monthly = effectiveNetMonthlyIncome(settings)
    const earnedPerDay = dim > 0 ? monthly / dim : 0
    const spentByDay = new Map<number, number>()
    for (const e of expenses) {
      const d = dayOfIso(e.date)
      spentByDay.set(d, (spentByDay.get(d) ?? 0) + e.amountCHF)
    }
    const pts: DailyPoint[] = []
    let spentCum = 0
    for (let d = 1; d <= dim; d++) {
      spentCum += spentByDay.get(d) ?? 0
      const earnedCum = earnedPerDay * d
      pts.push({
        day: d,
        earned: earnedCum,
        spent: spentCum,
        earnedHours: toHours(earnedCum, hourly),
        spentHours: toHours(spentCum, hourly),
      })
    }
    return pts
  }, [settings, dim, expenses, hourly])

  const rangePoints = useMemo<DailyPoint[]>(() => {
    if (timeRange === '1M') return dailyPoints
    const pts: DailyPoint[] = []
    let earnedCum = 0
    let spentCum = 0
    for (let idx = 0; idx < rangeMonthlyData.length; idx++) {
      const m = rangeMonthlyData[idx]
      earnedCum += m.earned
      spentCum += m.spent
      pts.push({
        day: idx + 1,
        dayLabel: m.label,
        earned: earnedCum,
        spent: spentCum,
        earnedHours: toHours(earnedCum, hourly),
        spentHours: toHours(spentCum, hourly),
      })
    }
    return pts
  }, [timeRange, dailyPoints, rangeMonthlyData, hourly])

  return {
    timeRangeLabel,
    rangeStats,
    dailyPoints,
    rangePoints,
    allRangeExpenses,
    budgetWarnings,
    timeOverspent,
  }
}
