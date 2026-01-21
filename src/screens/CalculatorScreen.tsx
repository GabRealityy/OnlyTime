/*
  Calculator screen.
  Converts a price in CHF into working time using hourly rate.
*/

import { useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { formatCHF, formatHoursMinutes } from '../lib/money'
import { Modal } from '../components/Modal'
import { addExpense, expenseCategories, monthKeyFromIsoDate, type ExpenseCategory } from '../lib/expenses'
import { isoDateLocal } from '../lib/date'

export function CalculatorScreen(props: { settings: Settings }) {
  const hourlyRate = hourlyRateCHF(props.settings)

  const [price, setPrice] = useState<string>('')
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [reflection, setReflection] = useState('')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saveCategory, setSaveCategory] = useState<ExpenseCategory>('Shopping')
  const [saveDate, setSaveDate] = useState<string>(isoDateLocal(new Date()))
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  const parsedPrice = useMemo(() => {
    const n = Number(price.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }, [price])

  const time = useMemo(() => {
    if (hourlyRate <= 0) return null
    const hours = parsedPrice / hourlyRate
    return hours
  }, [hourlyRate, parsedPrice])

  const handleSaveExpense = () => {
    if (parsedPrice <= 0 || !saveTitle.trim()) {
      setSaveFeedback('Bitte Titel und gültigen Betrag eingeben')
      return
    }

    const monthKey = monthKeyFromIsoDate(saveDate)
    addExpense(monthKey, {
      date: saveDate,
      amountCHF: parsedPrice,
      title: saveTitle.trim(),
      category: saveCategory,
    })

    setSaveFeedback('✓ Als Ausgabe gespeichert!')
    setTimeout(() => {
      setSaveModalOpen(false)
      setSaveFeedback(null)
      setSaveTitle('')
      setPrice('')
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div className="ot-card">
        <div className="text-lg font-semibold">Calculator</div>
        <div className="mt-1 text-sm text-zinc-400">
          Convert a price into time.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="price">Price (CHF)</label>
            <input
              id="price"
              inputMode="decimal"
              placeholder="e.g. 79"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-600 dark:text-zinc-500">Hourly rate</div>
            <div className="mt-1 font-mono text-sm">
              {hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : 'Set it in Settings'}
            </div>

            <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-500">Time cost</div>
            <div className="mt-1 text-2xl font-semibold">
              {time === null ? '—' : formatHoursMinutes(time)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="ot-btn"
              onClick={() => {
                setPrice('')
                setReflection('')
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="ot-btn"
              onClick={() => setReflectionOpen(true)}
              disabled={hourlyRate <= 0}
            >
              Optional reflection
            </button>
            <button
              type="button"
              className="ot-btn ot-btn-primary"
              onClick={() => {
                setSaveDate(isoDateLocal(new Date()))
                setSaveModalOpen(true)
              }}
              disabled={parsedPrice <= 0 || hourlyRate <= 0}
            >
              Als Ausgabe speichern
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Reflection"
        open={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
      >
        <div className="space-y-3">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Not a budget. Just a check-in.
          </div>
          <textarea
            rows={5}
            placeholder="What am I trading my time for?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
          <div className="text-xs text-zinc-500">
            This text is not stored anywhere.
          </div>
        </div>
      </Modal>

      <Modal
        title="Als Ausgabe speichern"
        open={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false)
          setSaveFeedback(null)
        }}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-600 dark:text-zinc-500">Betrag</div>
            <div className="mt-1 text-xl font-semibold">{formatCHF(parsedPrice)}</div>
            {time !== null && (
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {formatHoursMinutes(time)} Arbeitszeit
              </div>
            )}
          </div>

          <div>
            <label htmlFor="save-title">Bezeichnung</label>
            <input
              id="save-title"
              placeholder="z.B. neue Schuhe"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="save-date">Datum</label>
              <input
                id="save-date"
                type="date"
                value={saveDate}
                onChange={(e) => setSaveDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="save-category">Kategorie</label>
              <select
                id="save-category"
                value={saveCategory}
                onChange={(e) => setSaveCategory(e.target.value as ExpenseCategory)}
              >
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {saveFeedback && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-2 text-sm text-emerald-300">
              {saveFeedback}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="ot-btn ot-btn-primary"
              onClick={handleSaveExpense}
              disabled={!!saveFeedback}
            >
              Speichern
            </button>
            <button
              type="button"
              className="ot-btn"
              onClick={() => {
                setSaveModalOpen(false)
                setSaveFeedback(null)
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
