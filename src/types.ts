/*
  Shared app-level types.
*/

export type Screen = 'status' | 'reports' | 'settings' | 'help' | 'imprint' | 'privacy'

export type Currency = 'CHF' | 'EUR' | 'USD'

export const currencySymbols: Record<Currency, string> = {
  CHF: 'CHF',
  EUR: '€',
  USD: '$',
}
