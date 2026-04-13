export const expenseCategories = [
  'Essen',
  'Mobilität',
  'Einkaufen',
  'Wohnen',
  'Freizeit',
  'Abos',
  'Sonstiges',
] as const

export const categoryEmojis: Record<string, string> = {
  Essen: '🍕',
  Mobilität: '🚲',
  Einkaufen: '🛒',
  Wohnen: '🏠',
  Freizeit: '🎮',
  Abos: '📅',
  Sonstiges: '📁',
}

export const AVAILABLE_EMOJIS = [
  '🍕', '🍔', '🍟', '🍿', '🥤', '☕', '🍺', '🍽️',
  '🚗', '🚌', '🚇', '✈️', '🚲', '⛽', '🚕', '🏍️',
  '🛒', '👕', '👔', '👗', '👟', '🎽', '🧥', '👜',
  '🎮', '🎬', '🎵', '🎸', '📚', '🎨', '🎭', '🎪',
  '💊', '🏥', '💉', '🩺', '🧘', '🏋️', '🧪', '🔬',
  '🏠', '💡', '🔧', '🔨', '🪛', '🧰', '📦', '🧹',
  '📱', '💻', '⌨️', '🖥️', '🖱️', '💾', '📷', '📸',
  '❤️', '💰', '💳', '🎁', '🎉', '🎂', '🎈', '⭐',
]

export type ExpenseCategory = (typeof expenseCategories)[number]

export type QuickAddPreset = {
  id: string
  title: string
  amountCHF: number
  category: ExpenseCategory | string
  emoji?: string
}

export type CustomCategory = {
  id: string
  name: string
  emoji?: string
}

export type CategoryBudget = {
  categoryId: string
  monthlyBudgetCHF?: number
  monthlyBudgetHours?: number
}

export type Expense = {
  id: string
  date: string
  amountCHF: number
  title: string
  category: string
  createdAt: number
  amountHours?: number
}

export function monthKeyFromIsoDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}
