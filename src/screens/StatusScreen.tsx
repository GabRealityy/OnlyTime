/*
  Status screen (default).

  Core question:
  "Am I ahead or behind the money I have earned so far this month?"

  Earned so far (linear accrual across days):
    earned = (monthlyIncome / daysInMonth) * today
*/

import { useEffect, useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { dayOfMonth, daysInMonth, isoDateLocal, monthKeyFromDate, monthLabel } from '../lib/date'
import { formatCHF, formatHoursMinutes, toHours } from '../lib/money'
import { addExpense, deleteExpense, expenseCategories, loadExpensesForMonth, type Expense, type ExpenseCategory, type QuickAddPreset } from '../lib/expenses'
import { LineChart, type DailyPoint } from '../components/LineChart'
import { QuickAddButtons } from '../components/QuickAddButtons'
import { ExpenseFormModal, type ExpenseFormData } from '../components/ExpenseFormModal'
import { CSVImportModal } from '../components/CSVImportModal'
import { showToast } from '../components/Toast'

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

  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpensesForMonth(monthKey))

  useEffect(() => {
    setExpenses(loadExpensesForMonth(monthKey))
  }, [monthKey])

  // Modal states
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)

  const hourly = hourlyRateCHF(props.settings)

  const earned = useMemo(() => {
    const monthly = props.settings.netMonthlyIncomeCHF
    if (monthly <= 0) return 0
    return (monthly / dim) * today
  }, [props.settings.netMonthlyIncomeCHF, dim, today])

  const spent = useMemo(() => sumSpent(expenses), [expenses])

  // Zeit-Berechnungen mit erweitertem Stundenlohn
  const earnedHours = toHours(earned, hourly)
  const spentHours = toHours(spent, hourly)
  const availableHours = earnedHours - spentHours

  const balanceCHF = earned - spent

  const isAhead = balanceCHF >= 0
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
    const warnings: Array<{ category: string; spent: number; budget: number; percentage: number }> = []
    
    for (const budget of props.settings.categoryBudgets) {
      const spent = categorySpending.get(budget.categoryId) || 0
      const percentage = (spent / budget.monthlyBudgetCHF) * 100
      
      if (percentage >= 80) {
        warnings.push({
          category: budget.categoryId,
          spent,
          budget: budget.monthlyBudgetCHF,
          percentage,
        })
      }
    }
    
    return warnings.sort((a, b) => b.percentage - a.percentage)
  }, [props.settings.categoryBudgets, categorySpending])

  const dailyPoints: DailyPoint[] = useMemo(() => {
    const monthly = props.settings.netMonthlyIncomeCHF
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
  }, [props.settings.netMonthlyIncomeCHF, dim, expenses, hourly])

  const onSaveExpense = (data: ExpenseFormData) => {
    const dateMonthKey = data.date.slice(0, 7)
    if (dateMonthKey !== monthKey) {
      showToast('Nur Ausgaben für den aktuellen Monat können erfasst werden.', 'error')
      return
    }

    const updated = addExpense(monthKey, {
      date: data.date,
      amountCHF: data.amountCHF,
      title: data.title,
      category: data.category as ExpenseCategory,
    })

    setExpenses(updated)
    showToast(`${data.title} erfolgreich gespeichert`, 'success')
  }

  const onQuickAdd = (preset: QuickAddPreset) => {
    const updated = addExpense(monthKey, {
      date: isoDateLocal(now),
      amountCHF: preset.amountCHF,
      title: preset.title,
      category: preset.category as ExpenseCategory,
    })
    setExpenses(updated)
    showToast(`${preset.title} erfasst: ${formatCHF(preset.amountCHF)}`, 'success', 2000)
  }

  const onCSVImport = (importedExpenses: Omit<Expense, 'id'>[]) => {
    let updated = expenses
    let importCount = 0
    
    for (const exp of importedExpenses) {
      const expMonthKey = exp.date.slice(0, 7)
      if (expMonthKey === monthKey) {
        updated = addExpense(monthKey, exp)
        importCount++
      }
    }
    
    setExpenses(updated)
    showToast(`${importCount} von ${importedExpenses.length} Ausgaben importiert`, 'success')
  }

  const onDeleteExpense = (id: string, title: string) => {
    const updated = deleteExpense(monthKey, id)
    setExpenses(updated)
    showToast(`${title} gelöscht`, 'info', 2000)
  }

  return (
    <div className="space-y-4">
      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Status</div>
            <div className="mt-1 text-sm text-zinc-400">
              {label} · {now.toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Today</div>
            <div className="font-mono text-sm">
              day {today}/{dim}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Earned so far</div>
            <div className="mt-1 text-xl font-semibold">{formatCHF(earned)}</div>
            {hourly > 0 && (
              <div className="mt-1 text-sm text-zinc-400">
                {formatHoursMinutes(earnedHours)} verdient
              </div>
            )}
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Spent this month</div>
            <div className="mt-1 text-xl font-semibold">{formatCHF(spent)}</div>
            {hourly > 0 && (
              <div className="mt-1 text-sm text-zinc-400">
                {formatHoursMinutes(spentHours)} ausgegeben
              </div>
            )}
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Balance</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold">
                {isAhead ? '🟢' : '🔴'} {formatCHF(balanceCHF)}
              </div>
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {hourly > 0 ? (
                <>
                  {formatHoursMinutes(availableHours)} verfügbare Zeit
                  <br />
                  <span className="text-xs text-zinc-500">
                    Stundenlohn: {formatCHF(hourly)}/h
                  </span>
                </>
              ) : (
                'Stundenlohn in Einstellungen festlegen'
              )}
            </div>
          </div>
        </div>

        {timeOverspent && hourly > 0 && (
          <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950/40 p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="text-sm font-semibold text-rose-300">
                  Zeitüberschreitung
                </div>
                <div className="mt-1 text-sm text-rose-200/80">
                  Du hast deine verdiente Zeit für diesen Monat bereits überschritten. 
                  Kommende Ausgaben nehmen dir Zeit aus zukünftigen Monaten.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Warnings */}
        {budgetWarnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {budgetWarnings.map((warning) => {
              const isExceeded = warning.percentage >= 100
              const categoryName = props.settings.customCategories.find(c => c.id === warning.category)?.name || warning.category
              
              return (
                <div
                  key={warning.category}
                  className={`rounded-xl border p-3 ${
                    isExceeded
                      ? 'border-rose-800 bg-rose-950/40'
                      : 'border-amber-800 bg-amber-950/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{isExceeded ? '🚫' : '⚠️'}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${
                        isExceeded ? 'text-rose-300' : 'text-amber-300'
                      }`}>
                        {isExceeded ? 'Budget überschritten' : 'Budget-Warnung'}: {categoryName}
                      </div>
                      <div className={`mt-1 text-sm ${
                        isExceeded ? 'text-rose-200/80' : 'text-amber-200/80'
                      }`}>
                        {formatCHF(warning.spent)} von {formatCHF(warning.budget)} ausgegeben
                        <span className="ml-2 font-semibold">
                          ({warning.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-900">
                        <div
                          className={`h-full transition-all ${
                            isExceeded ? 'bg-rose-500' : 'bg-amber-500'
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

      <LineChart points={dailyPoints} hourlyRate={hourly} showTimeAxis={hourly > 0} />

      <QuickAddButtons 
        presets={props.settings.quickAddPresets}
        hourlyRate={hourly}
        onAddExpense={onQuickAdd}
      />

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Ausgabe erfassen</div>
            <div className="mt-1 text-xs text-zinc-500">Nur für aktuellen Monat</div>
          </div>
          <div className="text-xs text-zinc-500">localStorage</div>
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
            <div className="text-sm font-semibold">Expenses ({label})</div>
            <div className="mt-1 text-xs text-zinc-500">{expenses.length} item(s)</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Total</div>
            <div className="font-mono text-sm">{formatCHF(spent)}</div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {expenses.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              No expenses recorded this month.
            </div>
          )}

          {expenses.map((e) => {
            const expenseHours = toHours(e.amountCHF, hourly)
            return (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">
                      {e.title?.trim() ? e.title : 'Untitled'}
                    </div>
                    <div className="shrink-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-400">
                      {e.category}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {e.date}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatCHF(e.amountCHF)}</div>
                    {hourly > 0 && (
                      <div className="text-xs text-zinc-500">
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
