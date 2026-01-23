/*
  Settings model (stored in localStorage).

  Required fields:
  - netMonthlyIncomeCHF (or use grossMonthlyIncomeCHF with taxRatePercent)
  - weeklyWorkingHours
  - weeksPerMonth (default 4.33)

  Optional fields:
  - commuteMinutesPerDay: Pendelzeit pro Arbeitstag
  - overtimeHoursPerWeek: Unbezahlte Überstunden pro Woche
  - grossMonthlyIncomeCHF: Bruttoeinkommen
  - taxRatePercent: Steuern und Sozialabgaben in Prozent
  - additionalIncomeSources: Liste zusätzlicher Einkommensquellen

  Derived:
  - effectiveMonthlyWorkingHours = (weeklyWorkingHours + overtimeHoursPerWeek + commuteHoursPerWeek) * weeksPerMonth
  - effectiveNetMonthlyIncome = netMonthlyIncomeCHF (oder berechnet aus Brutto) + Summe additionalIncomeSources
  - hourlyRateCHF = effectiveNetMonthlyIncome / effectiveMonthlyWorkingHours
*/

import { loadFromStorage, saveToStorage, storageKeys } from './storage'
import type { QuickAddPreset, CustomCategory, CategoryBudget } from './expenses'

export type IncomeSource = {
  id: string
  name: string
  amountCHF: number
  hoursPerMonth: number
}

export type Settings = {
  // Haupteinkommen
  netMonthlyIncomeCHF: number
  // Alternative: Brutto-Netto Berechnung
  grossMonthlyIncomeCHF: number
  taxRatePercent: number
  useGrossIncome: boolean
  // Arbeitszeit
  weeklyWorkingHours: number
  weeksPerMonth: number
  // Zeitfaktoren
  commuteMinutesPerDay: number
  overtimeHoursPerWeek: number
  workingDaysPerWeek: number
  // Zusätzliche Einkommen
  additionalIncomeSources: IncomeSource[]
  // Quick-Add & Kategorien (Schritt 3)
  quickAddPresets: QuickAddPreset[]
  customCategories: CustomCategory[]
  categoryBudgets: CategoryBudget[]
  // Display preferences
  preferTimeDisplay: boolean
}

export const defaultSettings: Settings = {
  netMonthlyIncomeCHF: 0,
  grossMonthlyIncomeCHF: 0,
  taxRatePercent: 0,
  useGrossIncome: false,
  weeklyWorkingHours: 40,
  weeksPerMonth: 4.33,
  commuteMinutesPerDay: 0,
  overtimeHoursPerWeek: 0,
  workingDaysPerWeek: 5,
  additionalIncomeSources: [],
  quickAddPresets: [
    { id: '1', title: 'Kaffee', amountCHF: 4.50, category: 'Food', emoji: '☕' },
    { id: '2', title: 'Mittagessen', amountCHF: 15, category: 'Food', emoji: '🍽️' },
    { id: '3', title: 'ÖV-Ticket', amountCHF: 3.40, category: 'Transport', emoji: '🚌' },
  ],
  customCategories: [],
  categoryBudgets: [],
  preferTimeDisplay: false,
}

export function normalizeSettings(input: unknown): Settings {
  const obj = (typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {})

  const netMonthlyIncomeCHF = toNumber(obj.netMonthlyIncomeCHF, defaultSettings.netMonthlyIncomeCHF)
  const grossMonthlyIncomeCHF = toNumber(obj.grossMonthlyIncomeCHF, defaultSettings.grossMonthlyIncomeCHF)
  const taxRatePercent = toNumber(obj.taxRatePercent, defaultSettings.taxRatePercent)
  const useGrossIncome = typeof obj.useGrossIncome === 'boolean' ? obj.useGrossIncome : defaultSettings.useGrossIncome
  const weeklyWorkingHours = toNumber(obj.weeklyWorkingHours, defaultSettings.weeklyWorkingHours)
  const weeksPerMonth = toNumber(obj.weeksPerMonth, defaultSettings.weeksPerMonth)
  const commuteMinutesPerDay = toNumber(obj.commuteMinutesPerDay, defaultSettings.commuteMinutesPerDay)
  const overtimeHoursPerWeek = toNumber(obj.overtimeHoursPerWeek, defaultSettings.overtimeHoursPerWeek)
  const workingDaysPerWeek = toNumber(obj.workingDaysPerWeek, defaultSettings.workingDaysPerWeek)
  
  let additionalIncomeSources: IncomeSource[] = []
  if (Array.isArray(obj.additionalIncomeSources)) {
    additionalIncomeSources = obj.additionalIncomeSources
      .map((source: unknown) => {
        if (typeof source !== 'object' || source === null) return null
        const s = source as Record<string, unknown>
        return {
          id: typeof s.id === 'string' ? s.id : String(Math.random()),
          name: typeof s.name === 'string' ? s.name : '',
          amountCHF: toNumber(s.amountCHF, 0),
          hoursPerMonth: toNumber(s.hoursPerMonth, 0),
        }
      })
      .filter((s): s is IncomeSource => s !== null)
  }

  // Quick-Add Presets
  let quickAddPresets: QuickAddPreset[] = defaultSettings.quickAddPresets
  if (Array.isArray(obj.quickAddPresets)) {
    quickAddPresets = obj.quickAddPresets
      .map((preset: unknown) => {
        if (typeof preset !== 'object' || preset === null) return null
        const p = preset as Record<string, unknown>
        return {
          id: typeof p.id === 'string' ? p.id : String(Math.random()),
          title: typeof p.title === 'string' ? p.title : '',
          amountCHF: toNumber(p.amountCHF, 0),
          category: typeof p.category === 'string' ? p.category : 'Other',
          emoji: typeof p.emoji === 'string' ? p.emoji : undefined,
        } as QuickAddPreset
      })
      .filter((p): p is QuickAddPreset => p !== null)
  }

  // Custom Categories
  let customCategories: CustomCategory[] = []
  if (Array.isArray(obj.customCategories)) {
    customCategories = obj.customCategories
      .map((cat: unknown) => {
        if (typeof cat !== 'object' || cat === null) return null
        const c = cat as Record<string, unknown>
        return {
          id: typeof c.id === 'string' ? c.id : String(Math.random()),
          name: typeof c.name === 'string' ? c.name : '',
          color: typeof c.color === 'string' ? c.color : undefined,
          emoji: typeof c.emoji === 'string' ? c.emoji : undefined,
        } as CustomCategory
      })
      .filter((c): c is CustomCategory => c !== null)
  }

  // Category Budgets
  let categoryBudgets: CategoryBudget[] = []
  if (Array.isArray(obj.categoryBudgets)) {
    categoryBudgets = obj.categoryBudgets
      .map((budget: unknown) => {
        if (typeof budget !== 'object' || budget === null) return null
        const b = budget as Record<string, unknown>
        const categoryId = typeof b.categoryId === 'string' ? b.categoryId : (typeof b.category === 'string' ? b.category : '')
        if (!categoryId) return null
        return {
          categoryId,
          monthlyBudgetCHF: typeof b.monthlyBudgetCHF === 'number' ? b.monthlyBudgetCHF : undefined,
          monthlyBudgetHours: typeof b.monthlyBudgetHours === 'number' ? b.monthlyBudgetHours : undefined,
        } as CategoryBudget
      })
      .filter((b): b is CategoryBudget => b !== null)
  }

  const preferTimeDisplay = typeof obj.preferTimeDisplay === 'boolean' 
    ? obj.preferTimeDisplay 
    : defaultSettings.preferTimeDisplay

  return {
    netMonthlyIncomeCHF: Math.max(0, netMonthlyIncomeCHF),
    grossMonthlyIncomeCHF: Math.max(0, grossMonthlyIncomeCHF),
    taxRatePercent: Math.max(0, Math.min(100, taxRatePercent)),
    useGrossIncome,
    weeklyWorkingHours: Math.max(0, weeklyWorkingHours),
    weeksPerMonth: Math.max(0.01, weeksPerMonth),
    commuteMinutesPerDay: Math.max(0, commuteMinutesPerDay),
    overtimeHoursPerWeek: Math.max(0, overtimeHoursPerWeek),
    workingDaysPerWeek: Math.max(1, Math.min(7, workingDaysPerWeek)),
    additionalIncomeSources,
    quickAddPresets,
    customCategories,
    categoryBudgets,
    preferTimeDisplay,
  }
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return n
  }
  return fallback
}

export function loadSettings(): Settings {
  const raw = loadFromStorage<unknown>(storageKeys.settings)
  return normalizeSettings(raw)
}

export function saveSettings(settings: Settings): void {
  saveToStorage(storageKeys.settings, settings)
}

/**
 * Berechnet das effektive monatliche Nettoeinkommen.
 * Berücksichtigt entweder direktes Netto oder berechnet es aus Brutto,
 * plus alle zusätzlichen Einkommensquellen.
 */
export function effectiveNetMonthlyIncome(settings: Settings): number {
  let primaryIncome = settings.netMonthlyIncomeCHF
  
  if (settings.useGrossIncome && settings.grossMonthlyIncomeCHF > 0) {
    const netRate = 1 - (settings.taxRatePercent / 100)
    primaryIncome = settings.grossMonthlyIncomeCHF * netRate
  }
  
  const additionalIncome = settings.additionalIncomeSources.reduce(
    (sum, source) => sum + source.amountCHF,
    0
  )
  
  return primaryIncome + additionalIncome
}

/**
 * Berechnet die gesamten monatlichen Arbeitsstunden.
 * Berücksichtigt reguläre Arbeitszeit, Pendelzeit, Überstunden und zusätzliche Einkommensquellen.
 */
export function monthlyWorkingHours(settings: Settings): number {
  // Pendelzeit pro Woche (in Stunden)
  const commuteHoursPerWeek = (settings.commuteMinutesPerDay * settings.workingDaysPerWeek) / 60
  
  // Gesamte wöchentliche Zeit
  const totalWeeklyHours = settings.weeklyWorkingHours + settings.overtimeHoursPerWeek + commuteHoursPerWeek
  
  // Monatliche Arbeitszeit aus Hauptjob
  let totalMonthlyHours = totalWeeklyHours * settings.weeksPerMonth
  
  // Zusätzliche Stunden aus Nebenjobs
  const additionalHours = settings.additionalIncomeSources.reduce(
    (sum, source) => sum + source.hoursPerMonth,
    0
  )
  
  totalMonthlyHours += additionalHours
  
  return totalMonthlyHours
}

/**
 * Berechnet den effektiven Stundenlohn.
 * Dies ist das gesamte Nettoeinkommen geteilt durch die gesamte aufgewendete Zeit.
 */
export function hourlyRateCHF(settings: Settings): number {
  const monthlyHours = monthlyWorkingHours(settings)
  if (monthlyHours <= 0) return 0
  
  const income = effectiveNetMonthlyIncome(settings)
  return income / monthlyHours
}

/**
 * Hilfsfunktion: Berechnet die wöchentliche Pendelzeit in Stunden
 */
export function weeklyCommuteHours(settings: Settings): number {
  return (settings.commuteMinutesPerDay * settings.workingDaysPerWeek) / 60
}
