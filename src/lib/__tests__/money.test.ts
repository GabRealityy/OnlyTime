/*
  Tests for money/time conversion functions.
*/

import { describe, it, expect } from 'vitest'
import { 
  formatCHF, 
  formatHoursMinutes, 
  toHours, 
  toMinutes, 
  toHoursMinutes 
} from '../money'

describe('formatCHF', () => {
  it('formats CHF amounts correctly', () => {
    const formatted100 = formatCHF(100)
    const formatted1234 = formatCHF(1234.56)
    const formatted0 = formatCHF(0)
    
    // CHF und Zahlen sollten enthalten sein (Locale-agnostisch)
    expect(formatted100).toContain('CHF')
    expect(formatted100).toMatch(/100/)
    expect(formatted1234).toContain('CHF')
    expect(formatted1234).toMatch(/1.*234.*56/)
    expect(formatted0).toContain('CHF')
    expect(formatted0).toMatch(/0[.,]00/)
  })

  it('rounds to 2 decimal places', () => {
    const rounded1 = formatCHF(1.234)
    const rounded2 = formatCHF(1.235)
    // Prüfe dass gerundet wird (1.23 oder 1,23 je nach Locale)
    expect(rounded1).toMatch(/1[.,]23/)
    expect(rounded2).toMatch(/1[.,]24/)
  })
})

describe('toHoursMinutes', () => {
  it('converts hours float to hours and minutes', () => {
    expect(toHoursMinutes(2.5)).toEqual({ hours: 2, minutes: 30 })
    expect(toHoursMinutes(1.25)).toEqual({ hours: 1, minutes: 15 })
    expect(toHoursMinutes(0.5)).toEqual({ hours: 0, minutes: 30 })
    expect(toHoursMinutes(3)).toEqual({ hours: 3, minutes: 0 })
  })

  it('handles negative values', () => {
    expect(toHoursMinutes(-2.5)).toEqual({ hours: -2, minutes: 30 })
  })

  it('handles invalid values', () => {
    expect(toHoursMinutes(NaN)).toEqual({ hours: 0, minutes: 0 })
    expect(toHoursMinutes(Infinity)).toEqual({ hours: 0, minutes: 0 })
  })
})

describe('formatHoursMinutes', () => {
  it('formats hours and minutes correctly', () => {
    expect(formatHoursMinutes(2.5)).toBe('2h 30m')
    expect(formatHoursMinutes(1.25)).toBe('1h 15m')
    expect(formatHoursMinutes(0.5)).toBe('0h 30m')
    expect(formatHoursMinutes(10)).toBe('10h 0m')
  })

  it('handles negative values with sign', () => {
    expect(formatHoursMinutes(-2.5)).toBe('-2h 30m')
  })

  it('handles edge cases', () => {
    expect(formatHoursMinutes(0)).toBe('0h 0m')
    expect(formatHoursMinutes(NaN)).toBe('0h 0m')
  })
})

describe('toHours', () => {
  it('converts CHF amount to hours based on hourly rate', () => {
    expect(toHours(100, 25)).toBe(4)
    expect(toHours(50, 25)).toBe(2)
    expect(toHours(37.5, 25)).toBe(1.5)
  })

  it('handles zero and negative hourly rates', () => {
    expect(toHours(100, 0)).toBe(0)
    expect(toHours(100, -25)).toBe(0)
  })

  it('handles invalid amounts', () => {
    expect(toHours(NaN, 25)).toBe(0)
    expect(toHours(Infinity, 25)).toBe(0)
  })

  it('handles real-world scenarios', () => {
    // Beispiel: Stundenlohn 35.50 CHF, Kauf 142 CHF
    const hourlyRate = 35.50
    const purchaseAmount = 142
    const expectedHours = 142 / 35.50
    expect(toHours(purchaseAmount, hourlyRate)).toBeCloseTo(expectedHours, 2)
  })
})

describe('toMinutes', () => {
  it('converts hours to minutes', () => {
    expect(toMinutes(1)).toBe(60)
    expect(toMinutes(2.5)).toBe(150)
    expect(toMinutes(0.5)).toBe(30)
    expect(toMinutes(0)).toBe(0)
  })

  it('rounds to nearest minute', () => {
    // 1.008333h = ~60.5 Min -> rundet zu 60
    expect(toMinutes(1.008333)).toBe(60)
    // 1.991667h = ~119.5 Min -> rundet zu 120  
    expect(toMinutes(1.991667)).toBe(120)
  })

  it('handles invalid values', () => {
    expect(toMinutes(NaN)).toBe(0)
    expect(toMinutes(Infinity)).toBe(0)
  })
})

describe('Time calculations integration', () => {
  it('calculates time cost for various purchases', () => {
    const hourlyRate = 30 // CHF/h
    
    // 90 CHF Essen -> 3 Stunden
    const meal = 90
    expect(toHours(meal, hourlyRate)).toBe(3)
    expect(formatHoursMinutes(toHours(meal, hourlyRate))).toBe('3h 0m')
    
    // 75 CHF Shopping -> 2.5 Stunden
    const shopping = 75
    expect(toHours(shopping, hourlyRate)).toBe(2.5)
    expect(formatHoursMinutes(toHours(shopping, hourlyRate))).toBe('2h 30m')
    
    // 45 CHF Transport -> 1.5 Stunden
    const transport = 45
    expect(toHours(transport, hourlyRate)).toBe(1.5)
    expect(formatHoursMinutes(toHours(transport, hourlyRate))).toBe('1h 30m')
  })

  it('handles earned vs spent time calculations', () => {
    const hourlyRate = 40 // CHF/h
    const earned = 2000 // CHF
    const spent = 1200 // CHF
    
    const earnedHours = toHours(earned, hourlyRate)
    const spentHours = toHours(spent, hourlyRate)
    const availableHours = earnedHours - spentHours
    
    expect(earnedHours).toBe(50) // 50 Stunden verdient
    expect(spentHours).toBe(30) // 30 Stunden ausgegeben
    expect(availableHours).toBe(20) // 20 Stunden verfügbar
    expect(formatHoursMinutes(availableHours)).toBe('20h 0m')
  })
})
