/*
  Status screen (default).

  Core question:
  "Am I ahead or behind the money I have earned so far this month?"

  Earned so far (linear accrual across days):
    earned = (monthlyIncome / daysInMonth) * today
*/

import { useEffect, useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF, effectiveNetMonthlyIncome } from '../lib/settings'
import { dayOfMonth, daysInMonth, isoDateLocal, monthKeyFromDate, monthLabel } from '../lib/date'
import { formatCHF, formatHoursMinutes, toHours } from '../lib/money'
import { addExpense, deleteExpense, loadExpensesForMonth, type Expense, type QuickAddPreset, categoryEmojis } from '../lib/expenses'
import { LineChart, type DailyPoint } from '../components/LineChart'
import { QuickAddButtons } from '../components/QuickAddButtons'
import { ExpenseFormModal, type ExpenseFormData } from '../components/ExpenseFormModal'
import { CSVImportModal } from '../components/CSVImportModal'
import { showToast } from '../components/Toast'
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

function toDay(isoDate: string): number {
  // isoDate expected: YYYY-MM-DD
  const d = Number(isoDate.slice(8, 10))
  return Number.isFinite(d) ? d : 1
}

export function StatusScreen(props: { settings: Settings }) {
  const now = new Date()
  const monthKey = monthKeyFromDate(now)
  const today = dayOfMonth(now)
  const dim = daysInMonth(now)
  const label = monthLabel(now)

  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpensesForMonth(monthKey))

  useEffect(() => {
    setExpenses(loadExpensesForMonth(monthKey))
  }, [monthKey, lastUpdate])

  // Modal states
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)

  const hourly = hourlyRateCHF(props.settings)

  const rangeMonthlyData = useMemo(
    () => buildMonthlyData(props.settings, timeRange, now),
    [props.settings, timeRange, now],
  )
  const rangeTotalStats = useMemo(
    () => summarizeMonthlyData(rangeMonthlyData, hourly),
    [rangeMonthlyData, hourly],
  )

  const timeRangeLabel = useMemo(() => {
    return timeRangeButtons.find((b) => b.id === timeRange)?.label ?? timeRange
  }, [timeRange])

  const earned = useMemo(() => {
    const monthly = effectiveNetMonthlyIncome(props.settings)
    if (monthly <= 0) return 0
    return (monthly / dim) * today
  }, [props.settings, dim, today])

  const spent = useMemo(() => sumSpent(expenses), [expenses])

  // Zeit-Berechnungen mit erweitertem Stundenlohn
  const earnedHours = toHours(earned, hourly)
  const spentHours = toHours(spent, hourly)
  // keep month-scoped values for warnings/budgets

  const timeOverspent = spentHours > earnedHours

  // Budget tracking per category
  const categorySpending = useMemo(() => {
    const spending = new Map<string, number>()
    for (const exp of expenses) {
      const cat = exp.category
      spending.set(cat, (spending.get(cat) || 0) + exp.amountCHF)
    }
    return spending
  }, [expenses])

  const budgetWarnings = useMemo(() => {
    const warnings: Array<{
      category: string
      spent: number
      budgetCHF: number
      budgetHours?: number
      percentage: number
    }> = []

    for (const budget of props.settings.categoryBudgets) {
      const spent = categorySpending.get(budget.categoryId) || 0

      // Calculate budget in CHF (convert from hours if needed)
      const budgetCHF = budget.monthlyBudgetCHF || (budget.monthlyBudgetHours ? budget.monthlyBudgetHours * hourly : 0)
      const percentage = budgetCHF > 0 ? (spent / budgetCHF) * 100 : 0

      if (percentage >= 80) {
        warnings.push({
          category: budget.categoryId,
          spent,
          budgetCHF,
          budgetHours: budget.monthlyBudgetHours,
          percentage,
        })
      }
    }

    return warnings.sort((a, b) => b.percentage - a.percentage)
  }, [props.settings.categoryBudgets, categorySpending])

  const allRangeExpenses = useMemo(() => {
    // Force re-evaluation on lastUpdate
    lastUpdate

    let all: Expense[] = []
    if (timeRange === '1M') {
      all = [...expenses]
    } else {
      // Load expenses for all months in range
      const keys = getMonthKeys(timeRange, now)
      for (const key of keys) {
        all.push(...loadExpensesForMonth(key))
      }
    }

    return all
  }, [timeRange, now, expenses, lastUpdate])

  // Helper function to format values based on preferTimeDisplay
  const formatValue = (chf: number, hours: number) => {
    if (!props.settings.preferTimeDisplay || hourly === 0) {
      // CHF first (default)
      return {
        primary: formatCHF(chf),
        secondary: hourly > 0 ? formatHoursMinutes(hours) : null,
      }
    } else {
      // Time first (when preferTimeDisplay is enabled)
      return {
        primary: formatHoursMinutes(hours),
        secondary: formatCHF(chf),
      }
    }
  }

  // Get unique categories from allRangeExpenses
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    for (const exp of allRangeExpenses) {
      cats.add(exp.category)
    }
    return Array.from(cats).sort()
  }, [allRangeExpenses])

  // Filtered and sorted expenses for the list
  const displayExpenses = useMemo(() => {
    let filtered = allRangeExpenses
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory)
    }

    return [...filtered].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      const finalCompare = dateCompare !== 0 ? dateCompare : b.createdAt - a.createdAt
      return sortOrder === 'desc' ? finalCompare : -finalCompare
    })
  }, [allRangeExpenses, selectedCategory, sortOrder])

  const dailyPoints: DailyPoint[] = useMemo(() => {
    const monthly = effectiveNetMonthlyIncome(props.settings)
    const earnedPerDay = dim > 0 ? monthly / dim : 0

    // Pre-sum expenses by day.
    const spentByDay = new Map<number, number>()
    for (const e of expenses) {
      const d = toDay(e.date)
      spentByDay.set(d, (spentByDay.get(d) ?? 0) + e.amountCHF)
    }

    let spentCum = 0
    const pts: DailyPoint[] = []
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
  }, [props.settings, dim, expenses, hourly])

  const rangePoints: DailyPoint[] = useMemo(() => {
    // For 1M, keep the detailed daily chart.
    if (timeRange === '1M') return dailyPoints

    let earnedCum = 0
    let spentCum = 0
    return rangeMonthlyData.map((m, idx) => {
      earnedCum += m.earned
      spentCum += m.spent
      return {
        day: idx + 1,
        dayLabel: m.label,
        earned: earnedCum,
        spent: spentCum,
        earnedHours: toHours(earnedCum, hourly),
        spentHours: toHours(spentCum, hourly),
      }
    })
  }, [timeRange, dailyPoints, rangeMonthlyData, hourly])

  const onSaveExpense = (data: ExpenseFormData) => {
    const dateMonthKey = data.date.slice(0, 7)

    addExpense(dateMonthKey, {
      date: data.date,
      amountCHF: data.amountCHF,
      title: data.title,
      category: data.category,
    })

    setLastUpdate(Date.now())
    showToast(`${data.title} erfolgreich gespeichert`, 'success')
  }

  const onQuickAdd = (preset: QuickAddPreset) => {
    addExpense(monthKey, {
      date: isoDateLocal(now),
      amountCHF: preset.amountCHF,
      title: preset.title,
      category: preset.category,
    })
    setLastUpdate(Date.now())
    showToast(`${preset.title} erfasst: ${formatCHF(preset.amountCHF)}`, 'success', 2000)
  }

  const onCSVImport = (importedExpenses: Omit<Expense, 'id'>[]) => {
    for (const exp of importedExpenses) {
      const expMonthKey = exp.date.slice(0, 7)
      addExpense(expMonthKey, exp)
    }

    setLastUpdate(Date.now())
    showToast(`${importedExpenses.length} Ausgaben importiert`, 'success')
  }

  const onDeleteExpense = (id: string, title: string) => {
    // Store the deleted expense for undo
    const deletedExpense = expenses.find(e => e.id === id)
    if (!deletedExpense) return

    const expMonthKey = deletedExpense.date.slice(0, 7)
    deleteExpense(expMonthKey, id)
    setLastUpdate(Date.now())

    showToast(
      `${title} gelöscht`,
      'info',
      5000,
      'Rückgängig',
      () => {
        // Restore the expense
        addExpense(expMonthKey, {
          date: deletedExpense.date,
          amountCHF: deletedExpense.amountCHF,
          title: deletedExpense.title,
          category: deletedExpense.category,
        })
        setLastUpdate(Date.now())
        showToast(`${title} wiederhergestellt`, 'success', 2000)
      }
    )
  }

  const getCategoryInfo = (catId: string) => {
    const custom = props.settings.customCategories.find((c) => c.id === catId)
    if (custom) return { name: custom.name, emoji: custom.emoji }
    return { name: catId, emoji: categoryEmojis[catId] }
  }

  return (
    <div className="space-y-6">
      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-black tracking-tighter">Status</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-secondary">
              {label} · {timeRangeLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-secondary">Tag</div>
            <div className="font-mono text-sm font-bold">
              {today}/{dim}
            </div>
          </div>
        </div>

        {/* Zeitraum-Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {timeRangeButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setTimeRange(btn.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all touch-manipulation active:scale-95 ${timeRange === btn.id
                ? 'ot-btn-active'
                : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border-secondary bg-card p-4 sm:p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 whitespace-nowrap">Verdienst ({timeRangeLabel})</div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-primary break-all">
              {formatValue(rangeTotalStats.earned, rangeTotalStats.earnedHours).primary}
            </div>
            {formatValue(rangeTotalStats.earned, rangeTotalStats.earnedHours).secondary && (
              <div className="mt-1 text-xs font-bold text-secondary break-all">
                {formatValue(rangeTotalStats.earned, rangeTotalStats.earnedHours).secondary}
              </div>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-border-secondary bg-card p-4 sm:p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 whitespace-nowrap">Ausgaben ({timeRangeLabel})</div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-primary break-all">
              {formatValue(rangeTotalStats.spent, rangeTotalStats.spentHours).primary}
            </div>
            {formatValue(rangeTotalStats.spent, rangeTotalStats.spentHours).secondary && (
              <div className="mt-1 text-xs font-bold text-secondary break-all">
                {formatValue(rangeTotalStats.spent, rangeTotalStats.spentHours).secondary}
              </div>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-primary bg-primary p-4 sm:p-5 text-primary-inverse shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 whitespace-nowrap">Bilanz ({timeRangeLabel})</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl sm:text-3xl font-black tracking-tighter break-all">
                {formatValue(rangeTotalStats.balance, rangeTotalStats.balanceHours).primary}
              </div>
            </div>
            {formatValue(rangeTotalStats.balance, rangeTotalStats.balanceHours).secondary && (
              <div className="mt-1 text-xs font-bold opacity-60 break-all">
                {formatValue(rangeTotalStats.balance, rangeTotalStats.balanceHours).secondary}
              </div>
            )}
          </div>
        </div>

        {timeOverspent && hourly > 0 && (
          <div className="mt-6 rounded-2xl border border-danger bg-danger-bg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-danger">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-danger">
                  Zeitüberschreitung
                </div>
                <div className="mt-1 text-sm font-medium text-danger-text">
                  Deine Ausgaben übersteigen dein aktuelles Zeitbudget.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Warnings */}
        {budgetWarnings.length > 0 && (
          <div className="mt-4 space-y-3">
            {budgetWarnings.map((warning) => {
              const isExceeded = warning.percentage >= 100
              const categoryName = props.settings.customCategories.find(c => c.id === warning.category)?.name || warning.category

              return (
                <div
                  key={warning.category}
                  className={`rounded-2xl border p-4 transition-all ${isExceeded
                    ? 'border-danger bg-danger-bg'
                    : 'border-warning bg-warning-bg'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${isExceeded ? 'text-danger' : 'text-warning'}`}>
                      {isExceeded ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-black uppercase tracking-widest ${isExceeded ? 'text-danger' : 'text-warning'
                        }`}>
                        {categoryName} {isExceeded ? 'Über Limit' : 'Warnung'}
                      </div>
                      <div className={`mt-1 text-sm font-bold ${isExceeded ? 'text-danger-text' : 'text-warning-text'
                        }`}>
                        {formatCHF(warning.spent)} / {formatCHF(warning.budgetCHF)}
                        <span className="ml-2">({warning.percentage.toFixed(0)}%)</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-input">
                        <div
                          className={`h-full transition-all duration-700 ease-out ${isExceeded ? 'bg-danger' : 'bg-warning'
                            }`}
                          style={{ width: `${Math.min(100, warning.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <LineChart
        points={rangePoints}
        hourlyRate={hourly}
        showTimeAxis={hourly > 0}
        showXAxis={true}
        title={timeRange === '1M' ? 'Dieser Monat' : `Zeitraum: ${timeRangeLabel}`}
        preferTimeDisplay={props.settings.preferTimeDisplay}
      />

      <QuickAddButtons
        presets={props.settings.quickAddPresets}
        hourlyRate={hourly}
        onAddExpense={onQuickAdd}
      />

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Ausgabe erfassen</div>
            <div className="mt-1 text-xs text-secondary">Nur für aktuellen Monat</div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="ot-btn ot-btn-primary flex-1"
            onClick={() => setShowExpenseForm(true)}
          >
            ➕ Manuelle Eingabe
          </button>
          <button
            type="button"
            className="ot-btn"
            onClick={() => setShowCSVImport(true)}
          >
            📄 CSV-Import
          </button>
        </div>
      </div>

      <ExpenseFormModal
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSave={onSaveExpense}
        hourlyRate={hourly}
        customCategories={props.settings.customCategories}
        preferTimeDisplay={props.settings.preferTimeDisplay}
      />

      <CSVImportModal
        open={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={onCSVImport}
        customCategories={props.settings.customCategories}
      />

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Expenses ({timeRange === '1M' ? label : timeRangeLabel})</div>
            <div className="mt-1 text-xs text-tertiary">{displayExpenses.length} item(s)</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-tertiary">Total</div>
              <div className="font-mono text-sm">{formatCHF(displayExpenses.reduce((sum, e) => sum + e.amountCHF, 0))}</div>
            </div>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-secondary hover:text-primary transition-colors"
              title={sortOrder === 'desc' ? 'Neueste zuerst' : 'Älteste zuerst'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {sortOrder === 'desc' ? (
                  <path d="m3 16 4 4 4-4M7 20V4M13 18h8M13 12h8M13 6h8" />
                ) : (
                  <path d="m3 8 4-4 4 4M7 4v16M13 18h8M13 12h8M13 6h8" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        {availableCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all'
                ? 'ot-btn-active'
                : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
                }`}
            >
              Alle
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                  ? 'ot-btn-active'
                  : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
                  }`}
              >
                {(() => {
                  const info = getCategoryInfo(cat)
                  return info.emoji ? `${info.emoji} ${info.name}` : info.name
                })()}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {displayExpenses.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-3 text-sm text-secondary">
              {selectedCategory === 'all'
                ? 'No expenses recorded in this period.'
                : `No expenses found in category "${selectedCategory}" for this period.`}
            </div>
          )}

          {displayExpenses.map((e) => {
            const expenseHours = toHours(e.amountCHF, hourly)
            return (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">
                      {e.title?.trim() ? e.title : 'Untitled'}
                    </div>
                    <div className="shrink-0 rounded-md border border-border bg-input px-2 py-0.5 text-xs text-secondary">
                      {getCategoryInfo(e.category).name}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-secondary">
                    {e.date}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatCHF(e.amountCHF)}</div>
                    {hourly > 0 && (
                      <div className="text-xs text-secondary">
                        {formatHoursMinutes(expenseHours)}
                      </div>
                    )}
                  </div>
                  <button type="button" className="ot-btn ot-btn-danger" onClick={() => onDeleteExpense(e.id, e.title)}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
