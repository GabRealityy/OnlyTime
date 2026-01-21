/*
  Calculator screen.
  Converts a price in CHF into working time using hourly rate.
*/

import { useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { formatCHF, formatHoursMinutes } from '../lib/money'
import { Modal } from '../components/Modal'

export function CalculatorScreen(props: { settings: Settings }) {
  const hourlyRate = hourlyRateCHF(props.settings)

  const [price, setPrice] = useState<string>('')
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [reflection, setReflection] = useState('')

  const parsedPrice = useMemo(() => {
    const n = Number(price.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }, [price])

  const time = useMemo(() => {
    if (hourlyRate <= 0) return null
    const hours = parsedPrice / hourlyRate
    return hours
  }, [hourlyRate, parsedPrice])

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
            <div className="text-xs text-zinc-500">Hourly rate</div>
            <div className="mt-1 font-mono text-sm">
              {hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : 'Set it in Settings'}
            </div>

            <div className="mt-3 text-xs text-zinc-500">Time cost</div>
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
          </div>
        </div>
      </div>

      <Modal
        title="Reflection"
        open={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
      >
        <div className="space-y-3">
          <div className="text-sm text-zinc-400">
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
    </div>
  )
}
