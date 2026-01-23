/*
  Verbessertes Expense-Eingabeformular als kompaktes Modal/Drawer
  Features:
  - Zeit-Eingabe Toggle (CHF oder h:m)
  - Tastatur-Shortcuts (Enter zum Speichern)
  - Inline-Fehlervalidierung
  - Auto-Focus auf Betrags-Feld
*/

import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { formatCHF, formatHoursMinutes, toHours } from '../lib/money'
import { expenseCategories, type ExpenseCategory, categoryEmojis } from '../lib/expenses'
import { isoDateLocal } from '../lib/date'

export type ExpenseFormData = {
  amountCHF: number
  title: string
  category: ExpenseCategory | string
  date: string
  note?: string
}

export function ExpenseFormModal(props: {
  open: boolean
  onClose: () => void
  onSave: (data: ExpenseFormData) => void
  hourlyRate: number
  initialData?: Partial<ExpenseFormData>
  customCategories?: Array<{ id: string; name: string; emoji?: string }>
  preferTimeDisplay?: boolean
}) {
  const { open, onClose, onSave, hourlyRate, initialData, customCategories = [], preferTimeDisplay = false } = props

  // Input Mode: 'chf' oder 'time' - default based on preferTimeDisplay
  const [inputMode, setInputMode] = useState<'chf' | 'time'>(preferTimeDisplay && hourlyRate > 0 ? 'time' : 'chf')

  // Form fields
  const [amountInput, setAmountInput] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<ExpenseCategory | string>('Essen')
  const [date, setDate] = useState<string>(isoDateLocal(new Date()))
  const [note, setNote] = useState<string>('')

  // Validation & errors
  const [errors, setErrors] = useState<{ amount?: string; title?: string }>({})

  const amountInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmountInput(initialData?.amountCHF?.toString() || '')
      setTitle(initialData?.title || '')
      setCategory(initialData?.category || 'Essen')
      setDate(initialData?.date || isoDateLocal(new Date()))
      setNote('')
      setErrors({})
      setInputMode(preferTimeDisplay && hourlyRate > 0 ? 'time' : 'chf')

      // Focus amount field after modal animation
      setTimeout(() => amountInputRef.current?.focus(), 100)
    }
  }, [open, initialData, preferTimeDisplay, hourlyRate])

  const parseTimeInput = (input: string): number | null => {
    // Format: "1:30" oder "1.5" oder "90"
    if (input.includes(':')) {
      const [hours, minutes] = input.split(':').map(Number)
      if (isNaN(hours) || isNaN(minutes)) return null
      return hours + minutes / 60
    }
    const num = Number(input.replace(',', '.'))
    return isNaN(num) ? null : num
  }

  const parseAmount = (): number | null => {
    if (inputMode === 'chf') {
      const num = Number(amountInput.replace(',', '.'))
      return isNaN(num) ? null : num
    } else {
      // Time mode: convert h:m to CHF
      const hours = parseTimeInput(amountInput)
      if (hours === null || hourlyRate <= 0) return null
      return hours * hourlyRate
    }
  }

  const validateAndSave = () => {
    const newErrors: { amount?: string; title?: string } = {}

    const parsedAmount = parseAmount()
    if (parsedAmount === null || parsedAmount <= 0) {
      newErrors.amount = inputMode === 'chf'
        ? 'Bitte gültigen Betrag eingeben'
        : 'Bitte gültige Zeit eingeben (z.B. 1:30)'
    }

    if (!title.trim()) {
      newErrors.title = 'Bitte Beschreibung eingeben'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && parsedAmount) {
      onSave({
        amountCHF: parsedAmount,
        title: title.trim(),
        category,
        date,
        note: note.trim() || undefined,
      })
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      validateAndSave()
    }
  }

  // Computed values for preview
  const parsedAmount = parseAmount()
  const timeHours = parsedAmount && hourlyRate > 0 ? toHours(parsedAmount, hourlyRate) : null

  const allCategories = [
    ...expenseCategories.map(cat => ({ id: cat, name: cat, emoji: categoryEmojis[cat] })),
    ...customCategories,
  ]

  return (
    <Modal
      title="Neue Ausgabe"
      open={open}
      onClose={onClose}
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Amount/Time Display & Calculator */}
        <div className="py-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {inputMode === 'chf' ? 'Betrag in CHF' : 'Zeitaufwand (h:m)'}
            </span>
          </div>

          <input
            ref={amountInputRef}
            id="amount"
            inputMode="decimal"
            className="w-full bg-transparent text-center text-5xl font-black tracking-tighter focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            placeholder={inputMode === 'chf' ? '0.00' : '0:00'}
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value)
              if (errors.amount) setErrors({ ...errors, amount: undefined })
            }}
          />

          {errors.amount && (
            <div className="mt-2 text-xs text-rose-500 font-bold">{errors.amount}</div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="group flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-2 text-xs font-bold transition-all hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-100"
              onClick={() => setInputMode(inputMode === 'chf' ? 'time' : 'chf')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-180">
                <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
              </svg>
              {inputMode === 'chf' ? 'Zu Zeit wechseln' : 'Zu CHF wechseln'}
            </button>
          </div>

          {/* Result Subtext */}
          <div className="mt-6 min-h-[1.5rem]">
            {parsedAmount && parsedAmount > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
                </svg>
                <span>
                  {inputMode === 'chf' && timeHours !== null ? formatHoursMinutes(timeHours) : formatCHF(parsedAmount)}
                </span>
              </div>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-700">
                Basis: {formatCHF(hourlyRate)}/h
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="expense-title" className="text-sm font-medium">
            Beschreibung *
          </label>
          <input
            id="expense-title"
            placeholder="z.B. Mittagessen, Tankstelle"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors({ ...errors, title: undefined })
            }}
          />
          {errors.title && (
            <div className="mt-1 text-xs text-rose-400">{errors.title}</div>
          )}
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-category" className="text-sm font-medium">
              Kategorie
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expense-date" className="text-sm font-medium">
              Datum
            </label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label htmlFor="expense-note" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Notiz (optional)
          </label>
          <textarea
            id="expense-note"
            rows={2}
            placeholder="Zusätzliche Informationen..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            className="ot-btn ot-btn-primary flex-1"
            onClick={validateAndSave}
          >
            Speichern
          </button>
          <button
            type="button"
            className="ot-btn"
            onClick={onClose}
          >
            Abbrechen
          </button>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-500">
          Tipp: Drücke Enter zum Speichern
        </div>
      </div>
    </Modal>
  )
}
