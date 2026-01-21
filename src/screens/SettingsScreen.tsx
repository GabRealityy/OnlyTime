/*
  Settings screen.
  Stores inputs in localStorage and shows derived values.
*/

import { useState } from 'react'
import { 
  monthlyWorkingHours, 
  hourlyRateCHF, 
  effectiveNetMonthlyIncome,
  weeklyCommuteHours,
  type Settings,
  type IncomeSource 
} from '../lib/settings'
import { formatCHF } from '../lib/money'
import { CategoryManager } from '../components/CategoryManager'
import { BudgetManager } from '../components/BudgetManager'
import { showToast } from '../components/Toast'
import { OnboardingChecklist, type ChecklistItem } from '../components/OnboardingChecklist'
import { loadExpensesForMonth } from '../lib/expenses'
import { monthKeyFromDate } from '../lib/date'
import { useTheme } from '../contexts/ThemeContext'

export function SettingsScreen(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props
  const { theme, toggleTheme } = useTheme()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showAdditionalIncome, setShowAdditionalIncome] = useState(settings.additionalIncomeSources.length > 0)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showBudgetManager, setShowBudgetManager] = useState(false)

  const monthlyHours = monthlyWorkingHours(settings)
  const hourlyRate = hourlyRateCHF(settings)
  const totalIncome = effectiveNetMonthlyIncome(settings)
  const commuteHours = weeklyCommuteHours(settings)

  const addIncomeSource = () => {
    const newSource: IncomeSource = {
      id: String(Date.now()),
      name: '',
      amountCHF: 0,
      hoursPerMonth: 0,
    }
    onChange({
      ...settings,
      additionalIncomeSources: [...settings.additionalIncomeSources, newSource],
    })
  }

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    onChange({
      ...settings,
      additionalIncomeSources: settings.additionalIncomeSources.map(source =>
        source.id === id ? { ...source, ...updates } : source
      ),
    })
  }

  const removeIncomeSource = (id: string) => {
    onChange({
      ...settings,
      additionalIncomeSources: settings.additionalIncomeSources.filter(source => source.id !== id),
    })
  }

  // Onboarding Checklist Items
  const checklistItems: ChecklistItem[] = [
    {
      id: 'hourly-rate',
      label: 'Stundenlohn einrichten',
      description: 'Monatseinkommen und Arbeitszeit angeben',
      completed: hourlyRate > 0,
    },
    {
      id: 'category',
      label: 'Erste eigene Kategorie anlegen',
      description: 'Individuelle Ausgabenkategorie erstellen',
      completed: settings.customCategories.length > 0,
    },
    {
      id: 'budget',
      label: 'Erstes Budget festlegen',
      description: 'Monatliches Limit für eine Kategorie setzen',
      completed: settings.categoryBudgets.length > 0,
    },
    {
      id: 'expense',
      label: 'Erste Ausgabe erfassen',
      description: 'Ausgabe manuell oder per Quick-Add speichern',
      completed: loadExpensesForMonth(monthKeyFromDate(new Date())).length > 0,
    },
  ]

  const handleChecklistClick = (id: string) => {
    // Scroll to relevant section or open modal
    switch (id) {
      case 'hourly-rate':
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'category':
        setShowCategoryManager(true)
        break
      case 'budget':
        setShowBudgetManager(true)
        break
      case 'expense':
        // Could navigate to status screen, but not possible from here
        showToast('Gehe zum Status-Screen, um eine Ausgabe zu erfassen', 'info')
        break
    }
  }

  return (
    <div className="space-y-4">
      {/* Theme Toggle */}
      <div className="ot-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Design</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Zwischen hellem und dunklem Modus wechseln
            </div>
          </div>
          <button
            type="button"
            className="ot-btn flex items-center gap-2"
            onClick={toggleTheme}
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Hell' : 'Dunkel'}</span>
          </button>
        </div>
      </div>

      {/* Haupteinkommen */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Einkommen</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Wähle zwischen Netto- oder Bruttoeinkommen
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useGrossIncome}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    useGrossIncome: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm">Bruttoeinkommen verwenden</span>
            </label>
          </div>

          {settings.useGrossIncome ? (
            <>
              <div>
                <label htmlFor="grossMonthlyIncome">
                  Brutto-Monatseinkommen (CHF)
                  <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-500">vor Steuern/Abgaben</span>
                </label>
                <input
                  id="grossMonthlyIncome"
                  inputMode="decimal"
                  placeholder="z.B. 7000"
                  value={String(settings.grossMonthlyIncomeCHF)}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      grossMonthlyIncomeCHF: Number(e.target.value.replace(',', '.')) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor="taxRate">
                  Steuern & Sozialabgaben (%)
                  <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-500">ca. 15-35%</span>
                </label>
                <input
                  id="taxRate"
                  inputMode="decimal"
                  placeholder="z.B. 25"
                  value={String(settings.taxRatePercent)}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(',', '.')) || 0
                    onChange({
                      ...settings,
                      taxRatePercent: Math.min(100, Math.max(0, val)),
                    })
                  }}
                />
                {settings.grossMonthlyIncomeCHF > 0 && settings.taxRatePercent > 0 && (
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                    ≈ {formatCHF(settings.grossMonthlyIncomeCHF * (1 - settings.taxRatePercent / 100))} netto
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="netMonthlyIncome">
                Netto-Monatseinkommen (CHF)
                <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-500">nach allen Abzügen</span>
              </label>
              <input
                id="netMonthlyIncome"
                inputMode="decimal"
                placeholder="z.B. 5500"
                value={String(settings.netMonthlyIncomeCHF)}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    netMonthlyIncomeCHF: Number(e.target.value.replace(',', '.')) || 0,
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Arbeitszeit */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Arbeitszeit</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Reguläre Arbeitsstunden pro Woche
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="weeklyHours">Wöchentliche Arbeitsstunden</label>
            <input
              id="weeklyHours"
              inputMode="decimal"
              placeholder="z.B. 40"
              value={String(settings.weeklyWorkingHours)}
              onChange={(e) =>
                onChange({
                  ...settings,
                  weeklyWorkingHours: Number(e.target.value.replace(',', '.')) || 0,
                })
              }
            />
          </div>
          <div>
            <label htmlFor="weeksPerMonth">
              Wochen pro Monat
              <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-500">Standard: 4.33</span>
            </label>
            <input
              id="weeksPerMonth"
              inputMode="decimal"
              placeholder="4.33"
              value={String(settings.weeksPerMonth)}
              onChange={(e) =>
                onChange({
                  ...settings,
                  weeksPerMonth: Number(e.target.value.replace(',', '.')) || 0,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Zeitfaktoren (erweitert) */}
      <div className="ot-card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="text-lg font-semibold">Zeitfaktoren</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Pendelzeit, Überstunden & Arbeitstage
            </div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="commuteMinutes">
                Pendelzeit pro Arbeitstag (Minuten)
                <span className="ml-2 text-xs text-zinc-500">Hin + Zurück</span>
              </label>
              <input
                id="commuteMinutes"
                inputMode="decimal"
                placeholder="z.B. 60"
                value={String(settings.commuteMinutesPerDay)}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    commuteMinutesPerDay: Number(e.target.value.replace(',', '.')) || 0,
                  })
                }
              />
              {settings.commuteMinutesPerDay > 0 && (
                <div className="mt-1 text-xs text-zinc-500">
                  = {commuteHours.toFixed(1)} h pro Woche, {(commuteHours * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-500">
                💡 Dein Arbeitsweg zählt zur Zeit, die du aufwendest, um dein Einkommen zu verdienen
              </div>
            </div>

            <div>
              <label htmlFor="overtimeHours">
                Unbezahlte Überstunden pro Woche
                <span className="ml-2 text-xs text-zinc-500">nicht extra vergütet</span>
              </label>
              <input
                id="overtimeHours"
                inputMode="decimal"
                placeholder="z.B. 5"
                value={String(settings.overtimeHoursPerWeek)}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    overtimeHoursPerWeek: Number(e.target.value.replace(',', '.')) || 0,
                  })
                }
              />
              {settings.overtimeHoursPerWeek > 0 && (
                <div className="mt-1 text-xs text-zinc-500">
                  = {(settings.overtimeHoursPerWeek * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
            </div>

            <div>
              <label htmlFor="workingDays">
                Arbeitstage pro Woche
                <span className="ml-2 text-xs text-zinc-500">für Pendelzeit-Berechnung</span>
              </label>
              <input
                id="workingDays"
                inputMode="decimal"
                placeholder="z.B. 5"
                value={String(settings.workingDaysPerWeek)}
                onChange={(e) => {
                  const val = Number(e.target.value.replace(',', '.')) || 0
                  onChange({
                    ...settings,
                    workingDaysPerWeek: Math.min(7, Math.max(1, val)),
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Zusätzliche Einkommen */}
      <div className="ot-card">
        <button
          onClick={() => setShowAdditionalIncome(!showAdditionalIncome)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="text-lg font-semibold">
              Zusätzliche Einkommen
              {settings.additionalIncomeSources.length > 0 && (
                <span className="ml-2 text-sm text-zinc-500">({settings.additionalIncomeSources.length})</span>
              )}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Nebenjobs, passive Einkünfte, etc.
            </div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${showAdditionalIncome ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdditionalIncome && (
          <div className="mt-4 space-y-3">
            {settings.additionalIncomeSources.map((source) => (
              <div key={source.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Name der Einkommensquelle"
                    value={source.name}
                    onChange={(e) => updateIncomeSource(source.id, { name: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button
                    onClick={() => removeIncomeSource(source.id)}
                    className="text-zinc-500 hover:text-red-500 transition-colors"
                    title="Entfernen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-zinc-500">Betrag (CHF/Monat)</label>
                    <input
                      inputMode="decimal"
                      placeholder="z.B. 500"
                      value={String(source.amountCHF)}
                      onChange={(e) =>
                        updateIncomeSource(source.id, {
                          amountCHF: Number(e.target.value.replace(',', '.')) || 0,
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Zeitaufwand (h/Monat)</label>
                    <input
                      inputMode="decimal"
                      placeholder="z.B. 20"
                      value={String(source.hoursPerMonth)}
                      onChange={(e) =>
                        updateIncomeSource(source.id, {
                          hoursPerMonth: Number(e.target.value.replace(',', '.')) || 0,
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addIncomeSource}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-600 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              + Einkommensquelle hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Berechnete Ergebnisse */}
      <div className="ot-card">
        <div className="text-sm font-semibold">Effektive Werte</div>
        <div className="mt-1 text-xs text-zinc-500">
          Diese Werte berücksichtigen alle oben angegebenen Faktoren
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-zinc-600 dark:text-zinc-400">Gesamtes Netto-Einkommen</div>
            <div className="font-mono">{formatCHF(totalIncome)}/Monat</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-zinc-600 dark:text-zinc-400">Gesamte Arbeitszeit</div>
            <div className="font-mono">{monthlyHours.toFixed(2)} h/Monat</div>
          </div>
          <div className="h-px bg-zinc-800 my-1"></div>
          <div className="flex items-center justify-between">
            <div className="text-zinc-300 font-medium">Effektiver Stundenlohn</div>
            <div className="font-mono text-lg font-semibold text-green-400">
              {hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : '—'}
            </div>
          </div>
        </div>

        {hourlyRate <= 0 && (
          <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/40 p-3 text-sm text-zinc-600 dark:text-zinc-400">
            Gib Einkommen und Arbeitszeit ein, um deinen effektiven Stundenlohn zu berechnen.
          </div>
        )}
        
        {hourlyRate > 0 && monthlyHours > 0 && (
          <div className="mt-3 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-3 text-sm text-emerald-300">
            ✓ Dein Stundenlohn ist berechnet. Die App kann jetzt Preise in Lebenszeit umrechnen.
          </div>
        )}
      </div>

      {/* Kategorien & Budgets */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Kategorien & Budgets</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Verwalte benutzerdefinierte Kategorien und setze monatliche Budgets
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="ot-btn ot-btn-primary w-full"
            onClick={() => setShowCategoryManager(true)}
          >
            📁 Kategorien verwalten ({settings.customCategories.length})
          </button>

          <button
            type="button"
            className="ot-btn w-full"
            onClick={() => setShowBudgetManager(true)}
          >
            💰 Budgets verwalten ({settings.categoryBudgets.length})
          </button>
        </div>
      </div>

      <CategoryManager
        open={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={settings.customCategories}
        onSave={(categories) => {
          onChange({ ...settings, customCategories: categories })
          showToast(`${categories.length} Kategorie(n) gespeichert`, 'success')
        }}
      />

      <BudgetManager
        open={showBudgetManager}
        onClose={() => setShowBudgetManager(false)}
        budgets={settings.categoryBudgets}
        customCategories={settings.customCategories}
        hourlyRate={hourlyRate}
        onSave={(budgets) => {
          onChange({ ...settings, categoryBudgets: budgets })
          showToast(`${budgets.length} Budget(s) gespeichert`, 'success')
        }}
      />
    </div>
  )
}
