import { useState } from 'react'
import type { Settings } from '../../lib/settings'
import { formatCHF } from '../../lib/money'
import { DecimalInput } from '../DecimalInput'
import { showToast } from '../Toast'
import { expenseCategories, categoryEmojis, AVAILABLE_EMOJIS, type QuickAddPreset } from '../../lib/expenses'

export function QuickAddSection(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null)

  const categoryOptions = [
    ...expenseCategories.map((cat) => ({ id: cat, name: cat, emoji: categoryEmojis[cat] })),
    ...settings.customCategories.map((cat) => ({ id: cat.id, name: cat.name, emoji: cat.emoji })),
  ]

  const updatePreset = (id: string, patch: Partial<QuickAddPreset>) => {
    onChange({
      ...settings,
      quickAddPresets: settings.quickAddPresets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }

  const addPreset = () => {
    const next: QuickAddPreset = {
      id: `qa-${Date.now()}`,
      title: 'Neue Schnellerfassung',
      amountCHF: 0,
      category: 'Sonstiges',
      emoji: '⚡',
    }
    onChange({ ...settings, quickAddPresets: [...settings.quickAddPresets, next] })
    showToast('Schnellerfassung hinzugefügt', 'success', 2000)
  }

  const removePreset = (id: string) => {
    const idx = settings.quickAddPresets.findIndex((p) => p.id === id)
    if (idx < 0) return
    const removed = settings.quickAddPresets[idx]
    const nextList = settings.quickAddPresets.filter((p) => p.id !== id)
    onChange({ ...settings, quickAddPresets: nextList })

    showToast(
      `Schnellerfassung gelöscht: ${removed.title || 'Ohne Titel'}`,
      'info',
      5000,
      'Rückgängig',
      () => {
        const restored = [...nextList]
        restored.splice(idx, 0, removed)
        onChange({ ...settings, quickAddPresets: restored })
        showToast('Wiederhergestellt', 'success', 2000)
      },
    )
  }

  return (
    <div className="ot-card">
      <div className="text-lg font-semibold">Schnellerfassung</div>
      <div className="mt-1 text-sm text-secondary">
        Diese Buttons erscheinen im Status und erfassen Ausgaben mit einem Klick.
      </div>

      <div className="mt-4 space-y-2">
        {settings.quickAddPresets.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-3 text-sm text-secondary">
            Noch keine Schnellerfassungen. Füge unten einen Button hinzu.
          </div>
        )}

        {settings.quickAddPresets.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-2 relative">
                <label className="text-xs text-tertiary">Emoji</label>
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center rounded-lg border-2 border-border bg-input text-xl hover:border-primary transition-colors"
                  onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === p.id ? null : p.id)}
                >
                  {p.emoji || '⚡'}
                </button>

                {showEmojiPickerFor === p.id && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-border bg-page p-2 shadow-2xl">
                    <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {AVAILABLE_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-card-hover text-lg transition-colors"
                          onClick={() => {
                            updatePreset(p.id, { emoji: em })
                            setShowEmojiPickerFor(null)
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs text-tertiary">Titel</label>
                <input
                  value={p.title}
                  onChange={(e) => updatePreset(p.id, { title: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="z.B. Kaffee"
                  className="w-full text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-tertiary">Betrag (CHF)</label>
                <DecimalInput
                  value={p.amountCHF ?? 0}
                  onChange={(val) => updatePreset(p.id, { amountCHF: val })}
                  className="w-full text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-tertiary">Kategorie</label>
                <select
                  value={String(p.category ?? 'Other')}
                  onChange={(e) => updatePreset(p.id, { category: e.target.value })}
                  className="w-full text-sm"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji ? `${c.emoji} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-tertiary">
                Vorschau: {p.emoji ? `${p.emoji} ` : ''}{p.title || 'Ohne Titel'} · {formatCHF(p.amountCHF || 0)}
              </div>
              <button type="button" className="ot-btn ot-btn-danger text-xs" onClick={() => removePreset(p.id)}>
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="ot-btn ot-btn-primary" onClick={addPreset}>
          ➕ Button hinzufügen
        </button>
      </div>
    </div>
  )
}
