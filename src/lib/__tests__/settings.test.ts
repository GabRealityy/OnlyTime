/**
 * Unit Tests für die erweiterte Stundenlohn-Berechnung
 * 
 * Diese Tests decken ab:
 * - Grundlegende Berechnung ohne erweiterte Felder
 * - Berechnung mit Pendelzeit
 * - Berechnung mit unbezahlten Überstunden
 * - Berechnung mit Brutto-Netto Konvertierung
 * - Berechnung mit zusätzlichen Einkommensquellen
 * - Kombinierte Szenarien
 */

import { describe, it, expect } from 'vitest'
import {
  monthlyWorkingHours,
  hourlyRateCHF,
  effectiveNetMonthlyIncome,
  weeklyCommuteHours,
  normalizeSettings,
  type Settings,
  type IncomeSource,
} from '../settings'
import { toHours, formatHoursMinutes } from '../money'

describe('settings - Erweiterte Stundenlohn-Berechnung', () => {
  // Basis-Settings für Tests
  const baseSettings: Settings = {
    netMonthlyIncomeCHF: 5000,
    grossMonthlyIncomeCHF: 0,
    taxRatePercent: 0,
    useGrossIncome: false,
    weeklyWorkingHours: 40,
    weeksPerMonth: 4.33,
    commuteMinutesPerDay: 0,
    overtimeHoursPerWeek: 0,
    workingDaysPerWeek: 5,
    additionalIncomeSources: [],
    quickAddPresets: [],
    customCategories: [],
    categoryBudgets: [],
    preferTimeDisplay: false,
    currency: 'CHF',
    showOnboardingChecklist: true,
  }

  describe('monthlyWorkingHours', () => {
    it('sollte korrekt berechnen ohne erweiterte Felder', () => {
      const hours = monthlyWorkingHours(baseSettings)
      expect(hours).toBeCloseTo(40 * 4.33, 2) // 173.2 Stunden
    })

    it('sollte Pendelzeit berücksichtigen (30 Min/Tag, 5 Tage)', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 30,
        workingDaysPerWeek: 5,
      }
      // 30 Min * 5 Tage = 150 Min = 2.5 Stunden pro Woche
      // (40 + 2.5) * 4.33 = 184.025 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(184.025, 2)
    })

    it('sollte Pendelzeit berücksichtigen (60 Min/Tag, 5 Tage)', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 5,
      }
      // 60 Min * 5 Tage = 300 Min = 5 Stunden pro Woche
      // (40 + 5) * 4.33 = 194.85 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(194.85, 2)
    })

    it('sollte unbezahlte Überstunden berücksichtigen', () => {
      const settings: Settings = {
        ...baseSettings,
        overtimeHoursPerWeek: 5,
      }
      // (40 + 5) * 4.33 = 194.85 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(194.85, 2)
    })

    it('sollte Pendelzeit UND Überstunden kombinieren', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 5,
        overtimeHoursPerWeek: 10,
      }
      // Pendelzeit: 60 * 5 / 60 = 5h/Woche
      // Total: (40 + 5 + 10) * 4.33 = 238.15 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(238.15, 2)
    })

    it('sollte zusätzliche Arbeitsstunden aus Nebenjobs addieren', () => {
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Nebenjob', amountCHF: 500, hoursPerMonth: 20 },
        { id: '2', name: 'Freelance', amountCHF: 1000, hoursPerMonth: 30 },
      ]
      const settings: Settings = {
        ...baseSettings,
        additionalIncomeSources: additionalSources,
      }
      // 40 * 4.33 + 20 + 30 = 223.2 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(223.2, 2)
    })

    it('sollte 4 Arbeitstage korrekt berücksichtigen', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 4,
      }
      // 60 Min * 4 Tage = 240 Min = 4 Stunden pro Woche
      // (40 + 4) * 4.33 = 190.52 Stunden
      const hours = monthlyWorkingHours(settings)
      expect(hours).toBeCloseTo(190.52, 2)
    })
  })

  describe('effectiveNetMonthlyIncome', () => {
    it('sollte Netto direkt zurückgeben wenn useGrossIncome false', () => {
      const income = effectiveNetMonthlyIncome(baseSettings)
      expect(income).toBe(5000)
    })

    it('sollte Netto aus Brutto berechnen', () => {
      const settings: Settings = {
        ...baseSettings,
        useGrossIncome: true,
        grossMonthlyIncomeCHF: 7000,
        taxRatePercent: 25,
      }
      // 7000 * (1 - 0.25) = 5250
      const income = effectiveNetMonthlyIncome(settings)
      expect(income).toBe(5250)
    })

    it('sollte zusätzliche Einkommen addieren', () => {
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Nebenjob', amountCHF: 500, hoursPerMonth: 20 },
        { id: '2', name: 'Mieteinnahmen', amountCHF: 1200, hoursPerMonth: 0 },
      ]
      const settings: Settings = {
        ...baseSettings,
        additionalIncomeSources: additionalSources,
      }
      // 5000 + 500 + 1200 = 6700
      const income = effectiveNetMonthlyIncome(settings)
      expect(income).toBe(6700)
    })

    it('sollte Brutto-Netto UND zusätzliche Einkommen kombinieren', () => {
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Nebenjob', amountCHF: 800, hoursPerMonth: 15 },
      ]
      const settings: Settings = {
        ...baseSettings,
        useGrossIncome: true,
        grossMonthlyIncomeCHF: 6000,
        taxRatePercent: 20,
        additionalIncomeSources: additionalSources,
      }
      // 6000 * 0.8 + 800 = 4800 + 800 = 5600
      const income = effectiveNetMonthlyIncome(settings)
      expect(income).toBe(5600)
    })
  })

  describe('hourlyRateCHF', () => {
    it('sollte korrekten Stundenlohn ohne erweiterte Felder berechnen', () => {
      const rate = hourlyRateCHF(baseSettings)
      // 5000 / (40 * 4.33) = 5000 / 173.2 ≈ 28.87
      expect(rate).toBeCloseTo(28.87, 2)
    })

    it('sollte 0 zurückgeben bei 0 Arbeitsstunden', () => {
      const settings: Settings = {
        ...baseSettings,
        weeklyWorkingHours: 0,
      }
      const rate = hourlyRateCHF(settings)
      expect(rate).toBe(0)
    })

    it('sollte reduzierten Stundenlohn mit Pendelzeit zeigen', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 5,
      }
      // 5000 / ((40 + 5) * 4.33) = 5000 / 194.85 ≈ 25.66
      const rate = hourlyRateCHF(settings)
      expect(rate).toBeCloseTo(25.66, 2)
    })

    it('sollte reduzierten Stundenlohn mit Überstunden zeigen', () => {
      const settings: Settings = {
        ...baseSettings,
        overtimeHoursPerWeek: 10,
      }
      // 5000 / ((40 + 10) * 4.33) = 5000 / 216.5 ≈ 23.09
      const rate = hourlyRateCHF(settings)
      expect(rate).toBeCloseTo(23.09, 2)
    })

    it('sollte erhöhten Stundenlohn mit Zusatzeinkommen zeigen', () => {
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Passiv', amountCHF: 1000, hoursPerMonth: 0 },
      ]
      const settings: Settings = {
        ...baseSettings,
        additionalIncomeSources: additionalSources,
      }
      // 6000 / (40 * 4.33) = 6000 / 173.2 ≈ 34.64
      const rate = hourlyRateCHF(settings)
      expect(rate).toBeCloseTo(34.64, 2)
    })

    it('sollte realistisches Szenario korrekt berechnen', () => {
      // Realistisches Beispiel: Vollzeitjob mit Pendeln und Nebenjob
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Nebenjob', amountCHF: 600, hoursPerMonth: 25 },
      ]
      const settings: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 5500,
        commuteMinutesPerDay: 45, // 45 Min pro Tag
        overtimeHoursPerWeek: 3,
        additionalIncomeSources: additionalSources,
      }
      
      // Stunden: 
      // Pendelzeit: 45 * 5 / 60 = 3.75h/Woche
      // Total wöchentlich: 40 + 3 + 3.75 = 46.75h
      // Monatlich: 46.75 * 4.33 + 25 = 227.4275
      
      // Einkommen: 5500 + 600 = 6100
      
      // Stundenlohn: 6100 / 227.4275 ≈ 26.82
      const rate = hourlyRateCHF(settings)
      expect(rate).toBeCloseTo(26.82, 2)
    })
  })

  describe('weeklyCommuteHours', () => {
    it('sollte 0 zurückgeben ohne Pendelzeit', () => {
      const hours = weeklyCommuteHours(baseSettings)
      expect(hours).toBe(0)
    })

    it('sollte korrekt für 30 Min/Tag, 5 Tage berechnen', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 30,
        workingDaysPerWeek: 5,
      }
      // 30 * 5 / 60 = 2.5 Stunden
      const hours = weeklyCommuteHours(settings)
      expect(hours).toBe(2.5)
    })

    it('sollte korrekt für 90 Min/Tag, 4 Tage berechnen', () => {
      const settings: Settings = {
        ...baseSettings,
        commuteMinutesPerDay: 90,
        workingDaysPerWeek: 4,
      }
      // 90 * 4 / 60 = 6 Stunden
      const hours = weeklyCommuteHours(settings)
      expect(hours).toBe(6)
    })
  })

  describe('normalizeSettings', () => {
    it('sollte Standardwerte für fehlende Felder verwenden', () => {
      const settings = normalizeSettings({})
      expect(settings.netMonthlyIncomeCHF).toBe(0)
      expect(settings.weeklyWorkingHours).toBe(40)
      expect(settings.commuteMinutesPerDay).toBe(0)
      expect(settings.additionalIncomeSources).toEqual([])
    })

    it('sollte negative Werte auf 0 normalisieren', () => {
      const settings = normalizeSettings({
        netMonthlyIncomeCHF: -100,
        commuteMinutesPerDay: -30,
        overtimeHoursPerWeek: -5,
      })
      expect(settings.netMonthlyIncomeCHF).toBe(0)
      expect(settings.commuteMinutesPerDay).toBe(0)
      expect(settings.overtimeHoursPerWeek).toBe(0)
    })

    it('sollte Steuersatz auf 0-100% begrenzen', () => {
      const settings1 = normalizeSettings({ taxRatePercent: -10 })
      expect(settings1.taxRatePercent).toBe(0)

      const settings2 = normalizeSettings({ taxRatePercent: 150 })
      expect(settings2.taxRatePercent).toBe(100)
    })

    it('sollte Arbeitstage pro Woche auf 1-7 begrenzen', () => {
      const settings1 = normalizeSettings({ workingDaysPerWeek: 0 })
      expect(settings1.workingDaysPerWeek).toBe(1)

      const settings2 = normalizeSettings({ workingDaysPerWeek: 10 })
      expect(settings2.workingDaysPerWeek).toBe(7)
    })

    it('sollte zusätzliche Einkommensquellen korrekt parsen', () => {
      const settings = normalizeSettings({
        additionalIncomeSources: [
          { id: 'test1', name: 'Nebenjob', amountCHF: 500, hoursPerMonth: 20 },
          { id: 'test2', name: 'Passiv', amountCHF: 200, hoursPerMonth: 0 },
        ],
      })
      expect(settings.additionalIncomeSources).toHaveLength(2)
      expect(settings.additionalIncomeSources[0].name).toBe('Nebenjob')
      expect(settings.additionalIncomeSources[1].amountCHF).toBe(200)
    })

    it('sollte ungültige Einkommensquellen filtern', () => {
      const settings = normalizeSettings({
        additionalIncomeSources: [
          { id: 'test1', name: 'Valid', amountCHF: 500, hoursPerMonth: 20 },
          null,
          'invalid',
          { id: 'test2', name: 'Also Valid', amountCHF: 100, hoursPerMonth: 5 },
        ],
      })
      expect(settings.additionalIncomeSources).toHaveLength(2)
    })

    it('sollte Komma als Dezimaltrenner akzeptieren', () => {
      const settings = normalizeSettings({
        netMonthlyIncomeCHF: '5500,50',
        weeklyWorkingHours: '42,5',
      })
      expect(settings.netMonthlyIncomeCHF).toBe(5500.5)
      expect(settings.weeklyWorkingHours).toBe(42.5)
    })
  })

  describe('Zeit-Berechnungen Integration', () => {
    it('sollte earned/spent Hours korrekt mit erweitertem Stundenlohn berechnen', () => {
      const settings: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 6000,
        weeklyWorkingHours: 40,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 5,
        overtimeHoursPerWeek: 5,
      }
      
      const rate = hourlyRateCHF(settings)
      // Pendelzeit: 60 * 5 / 60 = 5h/Woche
      // Total: (40 + 5 + 5) * 4.33 = 216.5h
      // Stundenlohn: 6000 / 216.5 ≈ 27.71
      expect(rate).toBeCloseTo(27.71, 2)
      
      // Beispiel: 3000 CHF verdient, 1500 CHF ausgegeben
      const earnedCHF = 3000
      const spentCHF = 1500
      
      const earnedHours = toHours(earnedCHF, rate)
      const spentHours = toHours(spentCHF, rate)
      const availableHours = earnedHours - spentHours
      
      // 3000 / 27.71 ≈ 108.27h verdient
      // 1500 / 27.71 ≈ 54.13h ausgegeben
      // Verfügbar: ≈ 54.14h
      expect(earnedHours).toBeCloseTo(108.27, 1)
      expect(spentHours).toBeCloseTo(54.13, 1)
      expect(availableHours).toBeCloseTo(54.14, 1)
    })

    it('sollte Zeitüberschreitung erkennen', () => {
      const settings: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 4000,
        weeklyWorkingHours: 40,
      }
      
      const rate = hourlyRateCHF(settings)
      
      // Beispiel: mehr ausgegeben als verdient
      const earnedCHF = 2000
      const spentCHF = 3000
      
      const earnedHours = toHours(earnedCHF, rate)
      const spentHours = toHours(spentCHF, rate)
      
      expect(spentHours).toBeGreaterThan(earnedHours)
      expect(earnedHours - spentHours).toBeLessThan(0)
    })

    it('sollte Auswirkung von Pendelzeit auf Kaufkraft zeigen', () => {
      // Szenario 1: ohne Pendelzeit
      const settingsWithoutCommute: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 5000,
        weeklyWorkingHours: 40,
        commuteMinutesPerDay: 0,
      }
      
      const rateWithoutCommute = hourlyRateCHF(settingsWithoutCommute)
      
      // Szenario 2: mit 60 Min Pendelzeit pro Tag
      const settingsWithCommute: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 5000,
        weeklyWorkingHours: 40,
        commuteMinutesPerDay: 60,
        workingDaysPerWeek: 5,
      }
      
      const rateWithCommute = hourlyRateCHF(settingsWithCommute)
      
      // Der Stundenlohn sinkt durch Pendelzeit
      expect(rateWithCommute).toBeLessThan(rateWithoutCommute)
      
      // Beispiel: 100 CHF Kauf
      const purchaseAmount = 100
      const hoursWithoutCommute = toHours(purchaseAmount, rateWithoutCommute)
      const hoursWithCommute = toHours(purchaseAmount, rateWithCommute)
      
      // Mit Pendelzeit kostet der Kauf mehr Arbeitszeit
      expect(hoursWithCommute).toBeGreaterThan(hoursWithoutCommute)
      
      // Konkret: ohne Pendeln ~3.46h, mit Pendeln ~3.89h
      expect(hoursWithoutCommute).toBeCloseTo(3.46, 1)
      expect(hoursWithCommute).toBeCloseTo(3.89, 1)
    })

    it('sollte komplexes Real-World-Szenario korrekt durchrechnen', () => {
      // Realitätsnahes Szenario
      const additionalSources: IncomeSource[] = [
        { id: '1', name: 'Freelance', amountCHF: 800, hoursPerMonth: 30 },
      ]
      
      const settings: Settings = {
        ...baseSettings,
        useGrossIncome: true,
        grossMonthlyIncomeCHF: 7500,
        taxRatePercent: 22,
        weeklyWorkingHours: 42,
        commuteMinutesPerDay: 45,
        workingDaysPerWeek: 5,
        overtimeHoursPerWeek: 4,
        additionalIncomeSources: additionalSources,
      }
      
      // Einkommen berechnen
      // netPrimary = 7500 * 0.78 = 5850
      // totalIncome = 5850 + 800 = 6650
      expect(effectiveNetMonthlyIncome(settings)).toBe(6650)
      
      // Stunden berechnen
      // commuteWeekly = 45 * 5 / 60 = 3.75h
      // weeklyTotal = 42 + 4 + 3.75 = 49.75h
      // monthlyTotal = 49.75 * 4.33 + 30 = 245.4175h
      expect(monthlyWorkingHours(settings)).toBeCloseTo(245.42, 2)
      
      // Stundenlohn
      const rate = 6650 / 245.4175 // ~27.10
      expect(hourlyRateCHF(settings)).toBeCloseTo(27.10, 2)
      
      // Ausgaben-Beispiel: monatlich verdient und ausgegeben
      const earnedThisMonth = 6650
      const spentThisMonth = 4200
      
      const earnedHours = toHours(earnedThisMonth, rate)
      const spentHours = toHours(spentThisMonth, rate)
      const availableHours = earnedHours - spentHours
      
      // Verdient: 6650 / 27.10 ≈ 245.39h (≈ monatliche Arbeitszeit)
      // Ausgegeben: 4200 / 27.10 ≈ 154.98h
      // Verfügbar: ≈ 90.41h
      expect(earnedHours).toBeCloseTo(245.39, 1)
      expect(spentHours).toBeCloseTo(154.98, 1)
      expect(availableHours).toBeCloseTo(90.41, 1)
      
      // Formatierte Ausgabe prüfen
      const formattedHours = formatHoursMinutes(availableHours)
      expect(formattedHours).toContain('90h')
      expect(formattedHours).toMatch(/2[0-9]m/) // ~24-25 Minuten je nach Rundung
    })

    it('sollte zeigen wie Überstunden die Zeit-Kosten erhöhen', () => {
      // Basis ohne Überstunden
      const settingsBase: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 5000,
        weeklyWorkingHours: 40,
        overtimeHoursPerWeek: 0,
      }
      
      // Mit 10h unbezahlten Überstunden
      const settingsOvertime: Settings = {
        ...baseSettings,
        netMonthlyIncomeCHF: 5000,
        weeklyWorkingHours: 40,
        overtimeHoursPerWeek: 10,
      }
      
      const rateBase = hourlyRateCHF(settingsBase)
      const rateOvertime = hourlyRateCHF(settingsOvertime)
      
      // Überstunden senken den effektiven Stundenlohn
      expect(rateOvertime).toBeLessThan(rateBase)
      
      // Beispiel: 200 CHF Kauf
      const purchase = 200
      const hoursBase = toHours(purchase, rateBase)
      const hoursOvertime = toHours(purchase, rateOvertime)
      
      // Mit Überstunden kostet der Kauf mehr Zeit
      expect(hoursOvertime).toBeGreaterThan(hoursBase)
      
      // Differenz zeigt den "versteckten" Zeitverlust
      const extraHours = hoursOvertime - hoursBase
      expect(extraHours).toBeGreaterThan(0)
    })
  })
})
