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
  type IncomeSource,
} from '../lib/settings'
import { formatCHF } from '../lib/money'
import { CategoryManager } from '../components/CategoryManager'
import { BudgetManager } from '../components/BudgetManager'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { showToast } from '../components/Toast'
import { OnboardingChecklist, type ChecklistItem } from '../components/OnboardingChecklist'
import { expenseCategories, type QuickAddPreset, categoryEmojis, AVAILABLE_EMOJIS } from '../lib/expenses'
import { loadExpensesForMonth } from '../lib/expenses'
import { monthKeyFromDate } from '../lib/date'
import { useTheme } from '../contexts/ThemeContext'
import { clearAllData } from '../lib/storage'
import { generateDummyData } from '../lib/dummyData'

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
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmDummyData, setShowConfirmDummyData] = useState(false)
  const [dummyDataMonths, setDummyDataMonths] = useState<number>(12)
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null)

  const monthlyHours = monthlyWorkingHours(settings)
  const hourlyRate = hourlyRateCHF(settings)
  const totalIncome = effectiveNetMonthlyIncome(settings)
  const commuteHours = weeklyCommuteHours(settings)

  const categoryOptions = [
    ...expenseCategories.map((cat) => ({ id: cat, name: cat, emoji: categoryEmojis[cat] })),
    ...settings.customCategories.map((cat) => ({ id: cat.id, name: cat.name, emoji: cat.emoji })),
  ]

  const updateQuickAddPreset = (id: string, patch: Partial<QuickAddPreset>) => {
    onChange({
      ...settings,
      quickAddPresets: settings.quickAddPresets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }

  const addQuickAddPreset = () => {
    const next: QuickAddPreset = {
      id: `qa-${Date.now()}`,
      title: 'Neue Schnellerfassung',
      amountCHF: 0,
      category: 'Sonstiges',
      emoji: '⚡',
    }
    onChange({ ...settings, quickAddPresets: [...settings.quickAddPresets, next] })
    showToast('Schnellerfassung hinzugefügt', 'success', 2000)
  }

  const removeQuickAddPreset = (id: string) => {
    const idx = settings.quickAddPresets.findIndex((p) => p.id === id)
    if (idx < 0) return
    const removed = settings.quickAddPresets[idx]
    const next = settings.quickAddPresets.filter((p) => p.id !== id)
    onChange({ ...settings, quickAddPresets: next })

    showToast(
      `Schnellerfassung gelöscht: ${removed.title || 'Ohne Titel'}`,
      'info',
      5000,
      'Rückgängig',
      () => {
        const restored = [...next]
        restored.splice(idx, 0, removed)
        onChange({ ...settings, quickAddPresets: restored })
        showToast('Wiederhergestellt', 'success', 2000)
      },
    )
  }

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
            <div className="mt-1 text-sm text-secondary">
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

      {/* Display Preferences */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Anzeigeeinstellungen</div>
        <div className="mt-1 text-sm text-secondary">
          Wie sollen Werte angezeigt werden?
        </div>
        
        <div className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.preferTimeDisplay}
              onChange={(e) =>
                onChange({
                  ...settings,
                  preferTimeDisplay: e.target.checked,
                })
              }
              className="h-4 w-4 mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">Zeit bevorzugen</div>
              <div className="mt-1 text-xs text-tertiary">
                Zeigt Stunden an erster Stelle und CHF dahinter. Fokussiert auf die Zeit, die du für dein Geld arbeitest.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Setup Checklist */}
      <OnboardingChecklist
        items={checklistItems}
        onItemClick={handleChecklistClick}
      />

      {/* Haupteinkommen */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Einkommen</div>
        <div className="mt-1 text-sm text-secondary">
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
                  <span className="ml-2 text-xs text-tertiary">vor Steuern/Abgaben</span>
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
                  <span className="ml-2 text-xs text-tertiary">ca. 15-35%</span>
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
                  <div className="mt-1 text-xs text-tertiary">
                    ≈ {formatCHF(settings.grossMonthlyIncomeCHF * (1 - settings.taxRatePercent / 100))} netto
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="netMonthlyIncome">
                Netto-Monatseinkommen (CHF)
                <span className="ml-2 text-xs text-tertiary">nach allen Abzügen</span>
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
        <div className="mt-1 text-sm text-secondary">
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
              <span className="ml-2 text-xs text-tertiary">Standard: 4.33</span>
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
            <div className="mt-1 text-sm text-secondary">
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
                <span className="ml-2 text-xs text-tertiary">Hin + Zurück</span>
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
                <div className="mt-1 text-xs text-tertiary">
                  = {commuteHours.toFixed(1)} h pro Woche, {(commuteHours * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
              <div className="mt-2 text-xs text-tertiary">
                💡 Dein Arbeitsweg zählt zur Zeit, die du aufwendest, um dein Einkommen zu verdienen
              </div>
            </div>

            <div>
              <label htmlFor="overtimeHours">
                Unbezahlte Überstunden pro Woche
                <span className="ml-2 text-xs text-tertiary">nicht extra vergütet</span>
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
                <div className="mt-1 text-xs text-tertiary">
                  = {(settings.overtimeHoursPerWeek * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
            </div>

            <div>
              <label htmlFor="workingDays">
                Arbeitstage pro Woche
                <span className="ml-2 text-xs text-tertiary">für Pendelzeit-Berechnung</span>
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
                <span className="ml-2 text-sm text-tertiary">({settings.additionalIncomeSources.length})</span>
              )}
            </div>
            <div className="mt-1 text-sm text-secondary">
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
              <div key={source.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
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
                    className="text-tertiary hover:text-danger transition-colors"
                    title="Entfernen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-tertiary">Betrag (CHF/Monat)</label>
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
                    <label className="text-xs text-tertiary">Zeitaufwand (h/Monat)</label>
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
              className="w-full py-2 px-3 rounded-lg border border-dashed border-border hover:border-primary text-sm text-tertiary hover:text-secondary transition-colors"
            >
              + Einkommensquelle hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Berechnete Ergebnisse */}
      <div className="ot-card">
        <div className="text-sm font-semibold">Effektive Werte</div>
        <div className="mt-1 text-xs text-tertiary">
          Diese Werte berücksichtigen alle oben angegebenen Faktoren
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-secondary">Gesamtes Netto-Einkommen</div>
            <div className="font-mono">{formatCHF(totalIncome)}/Monat</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-secondary">Gesamte Arbeitszeit</div>
            <div className="font-mono">{monthlyHours.toFixed(2)} h/Monat</div>
          </div>
          <div className="h-px bg-border my-1"></div>
          <div className="flex items-center justify-between">
            <div className="text-primary font-medium">Effektiver Stundenlohn</div>
            <div className="font-mono text-lg font-semibold text-success">
              {hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : '—'}
            </div>
          </div>
        </div>

        {hourlyRate <= 0 && (
          <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-secondary">
            Gib Einkommen und Arbeitszeit ein, um deinen effektiven Stundenlohn zu berechnen.
          </div>
        )}

        {hourlyRate > 0 && monthlyHours > 0 && (
          <div className="mt-3 rounded-xl border border-success bg-success-bg p-3 text-sm text-success">
            ✓ Dein Stundenlohn ist berechnet. Die App kann jetzt Preise in Arbeitszeit umrechnen.
          </div>
        )}
      </div>

      {/* Schnellerfassung (Quick-Add) */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Schnellerfassung</div>
        <div className="mt-1 text-sm text-secondary">
          Diese Buttons erscheinen im Status und erfassen Ausgaben mit einem Klick.
        </div>

        <div className="mt-4 space-y-2">
          {settings.quickAddPresets.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-3 text-sm text-secondary">
              Noch keine Schnellerfassungen. Füge unten einen Button hinzu.
            </div>
          )}

          {settings.quickAddPresets.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-2 relative">
                  <label className="text-xs text-tertiary">Emoji</label>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-center rounded-lg border-2 border-border bg-input text-xl hover:border-primary transition-colors"
                    onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === p.id ? null : p.id)}
                  >
                    {p.emoji || '⚡'}
                  </button>

                  {showEmojiPickerFor === p.id && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-border bg-page p-2 shadow-2xl">
                      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {AVAILABLE_EMOJIS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-card-hover text-lg transition-colors"
                            onClick={() => {
                              updateQuickAddPreset(p.id, { emoji: em })
                              setShowEmojiPickerFor(null)
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs text-tertiary">Titel</label>
                  <input
                    value={p.title}
                    onChange={(e) => updateQuickAddPreset(p.id, { title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    placeholder="z.B. Kaffee"
                    className="w-full text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs text-tertiary">Betrag (CHF)</label>
                  <input
                    inputMode="decimal"
                    value={String(p.amountCHF ?? 0)}
                    onChange={(e) =>
                      updateQuickAddPreset(p.id, {
                        amountCHF: Number(e.target.value.replace(',', '.')) || 0,
                      })
                    }
                    className="w-full text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs text-tertiary">Kategorie</label>
                  <select
                    value={String(p.category ?? 'Other')}
                    onChange={(e) => updateQuickAddPreset(p.id, { category: e.target.value })}
                    className="w-full text-sm"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji ? `${c.emoji} ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-tertiary">
                  Vorschau: {p.emoji ? `${p.emoji} ` : ''}{p.title || 'Ohne Titel'} · {formatCHF(p.amountCHF || 0)}
                </div>
                <button
                  type="button"
                  className="ot-btn ot-btn-danger text-xs"
                  onClick={() => removeQuickAddPreset(p.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="ot-btn ot-btn-primary" onClick={addQuickAddPreset}>
            ➕ Button hinzufügen
          </button>
        </div>
      </div>

      {/* Kategorien & Budgets */}
      <div className="ot-card">
        <div className="text-lg font-semibold">Kategorien & Budgets</div>
        <div className="mt-1 text-sm text-secondary">
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

      {/* Daten zurücksetzen */}
      <div className="ot-card border-danger bg-danger-bg">
        <div className="text-lg font-semibold text-danger">Gefahrenzone</div>
        <div className="mt-1 text-sm text-secondary">
          Lösche alle Einstellungen und Ausgaben dauerhaft
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="ot-btn w-full border-warning text-warning hover:bg-warning-bg"
            onClick={() => setShowConfirmDummyData(true)}
          >
            🎲 Dummy-Daten laden
          </button>
          
          <button
            type="button"
            className="ot-btn ot-btn-danger w-full"
            onClick={() => setShowConfirmReset(true)}
          >
            🗑️ Alle Daten löschen
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

      <ConfirmDialog
        open={showConfirmReset}
        title="Alle Daten löschen?"
        message="Bist du sicher? Dies löscht alle deine Ausgaben und Einstellungen unwiderruflich. Die App wird danach neu geladen."
        confirmLabel="Ja, alles löschen"
        cancelLabel="Abbrechen"
        dangerous
        onConfirm={() => {
          clearAllData()
          window.location.reload()
        }}
        onCancel={() => setShowConfirmReset(false)}
      />

      {showConfirmDummyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Dummy-Daten laden</h3>
            <p className="text-sm text-secondary mb-4">
              Dies erstellt realistische Beispiel-Ausgaben für Tests und Demonstrationen.
              <strong className="block mt-2 text-warning">
                ⚠️ Warnung: Vorhandene Ausgaben werden überschrieben!
              </strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Zeitraum wählen:
              </label>
              <div className="space-y-2">
                {[3, 6, 12, 24, 60].map((months) => (
                  <label key={months} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dummyDataMonths"
                      checked={dummyDataMonths === months}
                      onChange={() => setDummyDataMonths(months)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      {months === 3 && '3 Monate'}
                      {months === 6 && '6 Monate'}
                      {months === 12 && '1 Jahr (12 Monate)'}
                      {months === 24 && '2 Jahre (24 Monate)'}
                      {months === 60 && '5 Jahre (60 Monate)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className="ot-btn flex-1"
                onClick={() => setShowConfirmDummyData(false)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="ot-btn ot-btn-primary flex-1"
                onClick={() => {
                  const count = generateDummyData(settings, dummyDataMonths)
                  setShowConfirmDummyData(false)
                  showToast(
                    `${count} Dummy-Ausgaben für ${dummyDataMonths} Monate erstellt`,
                    'success',
                    3000
                  )
                  // Trigger a reload of the status screen by changing a timestamp
                  setTimeout(() => {
                    window.location.reload()
                  }, 1000)
                }}
              >
                Laden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
