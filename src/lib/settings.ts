/*
  Settings model (stored in localStorage).

  Required fields:
  - netMonthlyIncomeCHF
  - weeklyWorkingHours
  - weeksPerMonth (default 4.33)

  Derived:
  - monthlyWorkingHours = weeklyWorkingHours * weeksPerMonth
  - hourlyRateCHF = netMonthlyIncomeCHF / monthlyWorkingHours
*/

import { loadFromStorage, saveToStorage, storageKeys } from './storage'

export type Settings = {
  netMonthlyIncomeCHF: number
  weeklyWorkingHours: number
  weeksPerMonth: number
}

export const defaultSettings: Settings = {
  netMonthlyIncomeCHF: 0,
  weeklyWorkingHours: 40,
  weeksPerMonth: 4.33,
}

export function normalizeSettings(input: unknown): Settings {
  const obj = (typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {})

  const netMonthlyIncomeCHF = toNumber(obj.netMonthlyIncomeCHF, defaultSettings.netMonthlyIncomeCHF)
  const weeklyWorkingHours = toNumber(obj.weeklyWorkingHours, defaultSettings.weeklyWorkingHours)
  const weeksPerMonth = toNumber(obj.weeksPerMonth, defaultSettings.weeksPerMonth)

  return {
    netMonthlyIncomeCHF: Math.max(0, netMonthlyIncomeCHF),
    weeklyWorkingHours: Math.max(0, weeklyWorkingHours),
    weeksPerMonth: Math.max(0.01, weeksPerMonth),
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

export function monthlyWorkingHours(settings: Settings): number {
  return settings.weeklyWorkingHours * settings.weeksPerMonth
}

export function hourlyRateCHF(settings: Settings): number {
  const monthlyHours = monthlyWorkingHours(settings)
  if (monthlyHours <= 0) return 0
  return settings.netMonthlyIncomeCHF / monthlyHours
}
