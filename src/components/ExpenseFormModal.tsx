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
import { expenseCategories, type ExpenseCategory } from '../lib/expenses'
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
}) {
  const { open, onClose, onSave, hourlyRate, initialData, customCategories = [] } = props

  // Input Mode: 'chf' oder 'time'
  const [inputMode, setInputMode] = useState<'chf' | 'time'>('chf')
  
  // Form fields
  const [amountInput, setAmountInput] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<ExpenseCategory | string>('Food')
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
      setCategory(initialData?.category || 'Food')
      setDate(initialData?.date || isoDateLocal(new Date()))
      setNote('')
      setErrors({})
      setInputMode('chf')
      
      // Focus amount field after modal animation
      setTimeout(() => amountInputRef.current?.focus(), 100)
    }
  }, [open, initialData])

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
    ...expenseCategories.map(cat => ({ id: cat, name: cat, emoji: undefined })),
    ...customCategories,
  ]

  return (
    <Modal
      title="Neue Ausgabe"
      open={open}
      onClose={onClose}
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Amount/Time Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="amount" className="text-sm font-medium">
              {inputMode === 'chf' ? 'Betrag (CHF)' : 'Zeit (h:m)'}
            </label>
            <button
              type="button"
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={() => setInputMode(inputMode === 'chf' ? 'time' : 'chf')}
            >
              ↔ {inputMode === 'chf' ? 'In Stunden eingeben' : 'In CHF eingeben'}
            </button>
          </div>
          <input
            ref={amountInputRef}
            id="amount"
            inputMode="decimal"
            placeholder={inputMode === 'chf' ? 'z.B. 15.50' : 'z.B. 1:30 oder 1.5'}
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value)
              if (errors.amount) setErrors({ ...errors, amount: undefined })
            }}
          />
          {errors.amount && (
            <div className="mt-1 text-xs text-rose-400">{errors.amount}</div>
          )}
          
          {/* Preview */}
          {parsedAmount && parsedAmount > 0 && (
            <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/40 p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-500">Entspricht:</span>
                <div className="text-right">
                  {inputMode === 'chf' && timeHours !== null && (
                    <div>{formatHoursMinutes(timeHours)} Arbeitszeit</div>
                  )}
                  {inputMode === 'time' && (
                    <div>{formatCHF(parsedAmount)}</div>
                  )}
                </div>
              </div>
            </div>
          )}
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
