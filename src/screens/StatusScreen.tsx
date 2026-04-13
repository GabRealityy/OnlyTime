import { useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { dayOfMonth, daysInMonth, isoDateLocal, monthKeyFromDate, monthLabel } from '../lib/date'
import { formatCHF } from '../lib/money'
import { addExpense, deleteExpense, type Expense, type QuickAddPreset, categoryEmojis } from '../lib/expenses'
import { useExpenses } from '../hooks/useExpenses'
import { useStatusAnalytics } from '../hooks/useStatusAnalytics'
import { LineChart } from '../components/LineChart'
import { QuickAddButtons } from '../components/QuickAddButtons'
import { ExpenseFormModal, type ExpenseFormData } from '../components/ExpenseFormModal'
import { CSVImportModal } from '../components/CSVImportModal'
import { showToast } from '../components/Toast'
import { StatusHeader } from '../components/status/StatusHeader'
import { RangeSummary } from '../components/status/RangeSummary'
import { ExpenseList } from '../components/status/ExpenseList'
import { BudgetWarnings } from '../components/status/BudgetWarnings'
import type { TimeRange } from '../lib/rangeAnalytics'

type Props = {
  settings: Settings
  onChange: (next: Settings) => void
  now?: Date
}

export function StatusScreen(props: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)

  const nowProp = props.now
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const monthKey = monthKeyFromDate(now)
  const today = dayOfMonth(now)
  const dim = daysInMonth(now)
  const label = monthLabel(now)

  const { expenses, mutate } = useExpenses(monthKey)
  const hourly = hourlyRateCHF(props.settings)

  const analytics = useStatusAnalytics({
    settings: props.settings,
    expenses,
    hourly,
    timeRange,
    now,
    dim,
    today,
  })

  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    for (const exp of analytics.allRangeExpenses) cats.add(exp.category)
    return Array.from(cats).sort()
  }, [analytics.allRangeExpenses])

  const displayExpenses = useMemo(() => {
    const filtered = selectedCategory === 'all'
      ? analytics.allRangeExpenses
      : analytics.allRangeExpenses.filter((e) => e.category === selectedCategory)
    return [...filtered].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      const finalCompare = dateCompare !== 0 ? dateCompare : b.createdAt - a.createdAt
      return sortOrder === 'desc' ? finalCompare : -finalCompare
    })
  }, [analytics.allRangeExpenses, selectedCategory, sortOrder])

  const onSaveExpense = (data: ExpenseFormData) => {
    addExpense(data.date.slice(0, 7), {
      date: data.date,
      amountCHF: data.amountCHF,
      title: data.title,
      category: data.category,
    })
    mutate()
    showToast(`${data.title} erfolgreich gespeichert`, 'success')
  }

  const onQuickAdd = (preset: QuickAddPreset) => {
    addExpense(monthKey, {
      date: isoDateLocal(now),
      amountCHF: preset.amountCHF,
      title: preset.title,
      category: preset.category,
    })
    mutate()
    showToast(`${preset.title} erfasst: ${formatCHF(preset.amountCHF)}`, 'success', 2000)
  }

  const onCSVImport = (importedExpenses: Omit<Expense, 'id'>[]) => {
    for (const exp of importedExpenses) addExpense(exp.date.slice(0, 7), exp)
    mutate()
    showToast(`${importedExpenses.length} Ausgaben importiert`, 'success')
  }

  const onDeleteExpense = (id: string, title: string) => {
    const deletedExpense = expenses.find((e) => e.id === id)
    if (!deletedExpense) return
    const expMonthKey = deletedExpense.date.slice(0, 7)
    deleteExpense(expMonthKey, id)
    mutate()
    showToast(`${title} gelöscht`, 'info', 5000, 'Rückgängig', () => {
      addExpense(expMonthKey, {
        date: deletedExpense.date,
        amountCHF: deletedExpense.amountCHF,
        title: deletedExpense.title,
        category: deletedExpense.category,
      })
      mutate()
      showToast(`${title} wiederhergestellt`, 'success', 2000)
    })
  }

  const getCategoryInfo = (catId: string) => {
    const custom = props.settings.customCategories.find((c) => c.id === catId)
    if (custom) return { name: custom.name, emoji: custom.emoji }
    return { name: catId, emoji: categoryEmojis[catId] }
  }

  return (
    <div className="space-y-6">
      <div className="ot-card">
        <StatusHeader
          label={label}
          timeRangeLabel={analytics.timeRangeLabel}
          timeRange={timeRange}
          today={today}
          dim={dim}
          hourly={hourly}
          settings={props.settings}
          onSettingsChange={props.onChange}
          onTimeRangeChange={setTimeRange}
        />

        <RangeSummary
          stats={analytics.rangeStats}
          timeRangeLabel={analytics.timeRangeLabel}
          hourly={hourly}
          preferTimeDisplay={props.settings.preferTimeDisplay}
        />

        {analytics.timeOverspent && hourly > 0 && <OverspentAlert />}

        <BudgetWarnings warnings={analytics.budgetWarnings} customCategories={props.settings.customCategories} />
      </div>

      <LineChart
        points={analytics.rangePoints}
        hourlyRate={hourly}
        showTimeAxis={hourly > 0}
        showXAxis={true}
        title={timeRange === '1M' ? 'Dieser Monat' : `Zeitraum: ${analytics.timeRangeLabel}`}
        preferTimeDisplay={props.settings.preferTimeDisplay}
        currentDay={timeRange === '1M' ? today : undefined}
      />

      <QuickAddButtons presets={props.settings.quickAddPresets} hourlyRate={hourly} onAddExpense={onQuickAdd} />

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Ausgabe erfassen</div>
            <div className="mt-1 text-xs text-secondary">Nur für aktuellen Monat</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="ot-btn ot-btn-primary flex-1" onClick={() => setShowExpenseForm(true)}>
            ➕ Manuelle Eingabe
          </button>
          <button type="button" className="ot-btn" onClick={() => setShowCSVImport(true)}>
            📄 CSV-Import
          </button>
        </div>
      </div>

      <ExpenseFormModal
        key={showExpenseForm ? 'open' : 'closed'}
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

      <ExpenseList
        heading={`Expenses (${timeRange === '1M' ? label : analytics.timeRangeLabel})`}
        expenses={displayExpenses}
        sortOrder={sortOrder}
        onToggleSort={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        availableCategories={availableCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        getCategoryInfo={getCategoryInfo}
        hourly={hourly}
        onDelete={onDeleteExpense}
      />
    </div>
  )
}

function OverspentAlert() {
  return (
    <div className="mt-6 rounded-2xl border border-danger bg-danger-bg p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-danger">Zeitüberschreitung</div>
          <div className="mt-1 text-sm font-medium text-danger-text">Deine Ausgaben übersteigen dein aktuelles Zeitbudget.</div>
        </div>
      </div>
    </div>
  )
}
