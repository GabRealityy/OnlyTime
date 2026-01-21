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
