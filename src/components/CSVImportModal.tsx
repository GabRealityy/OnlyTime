/*
  CSV-Import für Ausgaben
  Features:
  - Drag & Drop / File Select
  - Automatisches Spalten-Mapping
  - Kategorie-Zuordnung mit Regel-System
  - Vorschau vor Import
*/

import { useState } from 'react'
import { Modal } from './Modal'
import { type Expense, type ExpenseCategory } from '../lib/expenses'
import { formatCHF } from '../lib/money'
import { isoDateLocal } from '../lib/date'

type CSVRow = Record<string, string>

type ColumnMapping = {
  date?: string
  amount?: string
  title?: string
  category?: string
}

type CategoryRule = {
  keyword: string
  category: ExpenseCategory | string
}

// Default rules for auto-categorization
const defaultRules: CategoryRule[] = [
  { keyword: 'coop', category: 'Food' },
  { keyword: 'migros', category: 'Food' },
  { keyword: 'lidl', category: 'Food' },
  { keyword: 'aldi', category: 'Food' },
  { keyword: 'restaurant', category: 'Food' },
  { keyword: 'kaffee', category: 'Food' },
  { keyword: 'coffee', category: 'Food' },
  { keyword: 'tankstelle', category: 'Transport' },
  { keyword: 'sbb', category: 'Transport' },
  { keyword: 'öv', category: 'Transport' },
  { keyword: 'uber', category: 'Transport' },
  { keyword: 'zara', category: 'Shopping' },
  { keyword: 'h&m', category: 'Shopping' },
  { keyword: 'amazon', category: 'Shopping' },
  { keyword: 'spotify', category: 'Entertainment' },
  { keyword: 'netflix', category: 'Entertainment' },
  { keyword: 'kino', category: 'Entertainment' },
  { keyword: 'apotheke', category: 'Health' },
  { keyword: 'arzt', category: 'Health' },
  { keyword: 'zahnarzt', category: 'Health' },
]

function parseCSV(text: string): CSVRow[] {
  const allLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (allLines.length < 2) return []

  // Delimiter-Erkennung: Was kommt im Header häufiger vor?
  const firstLine = allLines[0]
  const commaCount = (firstLine.match(/,/g) || []).length
  const semiCount = (firstLine.match(/;/g) || []).length
  const delimiter = semiCount >= commaCount && semiCount > 0 ? ';' : ','

  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: CSVRow[] = []

  for (let i = 1; i < allLines.length; i++) {
    const values = allLines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''))
    if (values.length === headers.length) {
      const row: CSVRow = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]
      })
      rows.push(row)
    }
  }

  return rows
}

function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}

  const datePatterns = ['date', 'datum', 'tag', 'day']
  const amountPatterns = ['amount', 'betrag', 'price', 'preis', 'value', 'wert', 'chf']
  const titlePatterns = ['title', 'description', 'beschreibung', 'text', 'name', 'bezeichnung']
  const categoryPatterns = ['category', 'kategorie', 'type', 'typ']

  headers.forEach(header => {
    const lower = header.toLowerCase()
    if (!mapping.date && datePatterns.some(p => lower.includes(p))) {
      mapping.date = header
    }
    if (!mapping.amount && amountPatterns.some(p => lower.includes(p))) {
      mapping.amount = header
    }
    if (!mapping.title && titlePatterns.some(p => lower.includes(p))) {
      mapping.title = header
    }
    if (!mapping.category && categoryPatterns.some(p => lower.includes(p))) {
      mapping.category = header
    }
  })

  return mapping
}

function guessCategory(title: string, rules: CategoryRule[]): ExpenseCategory | string {
  const lower = title.toLowerCase()
  for (const rule of rules) {
    if (lower.includes(rule.keyword.toLowerCase())) {
      return rule.category
    }
  }
  return 'Other'
}

function parseDate(dateStr: string): string {
  // Try various formats: YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr

  const parts = dateStr.split(/[./-]/)
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number)
    // DD.MM.YYYY or DD/MM/YYYY
    if (a <= 31 && b <= 12 && c > 999) {
      return `${c}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`
    }
    // MM/DD/YYYY
    if (a <= 12 && b <= 31 && c > 999) {
      return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`
    }
  }

  return isoDateLocal(new Date())
}

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0

  // Entferne alle Zeichen außer Ziffern, Komma, Punkt und Minus
  let cleaned = amountStr.replace(/[^0-9.,-]/g, '')

  // Wenn sowohl Komma als auch Punkt vorhanden sind (z.B. 1.234,56 oder 1,234.56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')

    if (lastComma > lastDot) {
      // Format 1.234,56 -> Punkt ist Tausendertrennzeichen
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // Format 1,234.56 -> Komma ist Tausendertrennzeichen
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    // Nur Komma (z.B. 12,50 oder 1234,56) -> Komma ist vermutlich Dezimaltrenner
    cleaned = cleaned.replace(',', '.')
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : Math.abs(num)
}

export function CSVImportModal(props: {
  open: boolean
  onClose: () => void
  onImport: (expenses: Omit<Expense, 'id'>[]) => void
  customCategories?: Array<{ id: string; name: string }>
}) {
  const { open, onClose, onImport } = props

  const [csvData, setCSVData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [previewExpenses, setPreviewExpenses] = useState<Array<Omit<Expense, 'id'>>>([])
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = parseCSV(text)

      if (rows.length === 0) {
        alert('Keine gültigen Daten gefunden')
        return
      }

      const cols = Object.keys(rows[0])
      const guessedMapping = guessColumnMapping(cols)

      setCSVData(rows)
      setHeaders(cols)
      setMapping(guessedMapping)
      setStep('mapping')
    }
    reader.readAsText(file)
  }

  const handlePreview = () => {
    if (!mapping.amount || !mapping.title) {
      alert('Bitte mindestens Betrag und Beschreibung zuordnen')
      return
    }

    const expenses: Array<Omit<Expense, 'id'>> = csvData
      .map(row => {
        const amountCHF = mapping.amount ? parseAmount(row[mapping.amount]) : 0
        const title = mapping.title ? row[mapping.title] : 'Unbekannt'
        const date = mapping.date ? parseDate(row[mapping.date]) : isoDateLocal(new Date())
        const categoryStr = mapping.category
          ? row[mapping.category]
          : guessCategory(title, defaultRules)
        const category = categoryStr as ExpenseCategory

        return { amountCHF, title, category, date, createdAt: Date.now() }
      })
      .filter(exp => exp.amountCHF > 0)

    setPreviewExpenses(expenses)
    setStep('preview')
  }

  const handleImport = () => {
    onImport(previewExpenses)
    resetAndClose()
  }

  const resetAndClose = () => {
    setCSVData([])
    setHeaders([])
    setMapping({})
    setPreviewExpenses([])
    setStep('upload')
    onClose()
  }

  return (
    <Modal
      title="CSV-Import"
      open={open}
      onClose={resetAndClose}
    >
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Lade eine CSV-Datei mit deinen Ausgaben hoch. Format: Datum, Betrag, Beschreibung (optional: Kategorie)
          </p>
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary hover:bg-card transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-secondary">
              <div className="text-3xl mb-2">📄</div>
              <div className="font-medium">CSV-Datei auswählen</div>
              <div className="text-xs mt-1">oder hierher ziehen</div>
            </div>
          </label>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Ordne die CSV-Spalten den Feldern zu:
          </p>

          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Datum</label>
              <select
                value={mapping.date || ''}
                onChange={(e) => setMapping({ ...mapping, date: e.target.value || undefined })}
              >
                <option value="">- Nicht zugeordnet -</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-danger-text">Betrag *</label>
              <select
                value={mapping.amount || ''}
                onChange={(e) => setMapping({ ...mapping, amount: e.target.value || undefined })}
              >
                <option value="">- Bitte auswählen -</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-danger-text">Beschreibung *</label>
              <select
                value={mapping.title || ''}
                onChange={(e) => setMapping({ ...mapping, title: e.target.value || undefined })}
              >
                <option value="">- Bitte auswählen -</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Kategorie</label>
              <select
                value={mapping.category || ''}
                onChange={(e) => setMapping({ ...mapping, category: e.target.value || undefined })}
              >
                <option value="">- Automatisch ermitteln -</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 text-xs text-secondary">
            <div className="font-medium mb-1">Vorschau (erste Zeile):</div>
            {csvData[0] && (
              <div className="space-y-1">
                {Object.entries(csvData[0]).map(([key, val]) => (
                  <div key={key}><span className="text-secondary">{key}:</span> {val}</div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button className="ot-btn ot-btn-primary flex-1" onClick={handlePreview}>
              Vorschau anzeigen
            </button>
            <button className="ot-btn" onClick={() => setStep('upload')}>
              Zurück
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">
              {previewExpenses.length} Ausgabe(n) bereit zum Import
            </p>
            <div className="text-sm font-medium">
              Total: {formatCHF(previewExpenses.reduce((sum, exp) => sum + exp.amountCHF, 0))}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {previewExpenses.slice(0, 10).map((exp, idx) => (
              <div key={idx} className="rounded-lg bg-card p-2 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{exp.title}</div>
                    <div className="text-xs text-secondary">
                      {exp.date} · {exp.category}
                    </div>
                  </div>
                  <div className="font-medium">{formatCHF(exp.amountCHF)}</div>
                </div>
              </div>
            ))}
            {previewExpenses.length > 10 && (
              <div className="text-center text-xs text-secondary py-2">
                ... und {previewExpenses.length - 10} weitere
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button className="ot-btn ot-btn-primary flex-1" onClick={handleImport}>
              {previewExpenses.length} Ausgabe(n) importieren
            </button>
            <button className="ot-btn" onClick={() => setStep('mapping')}>
              Zurück
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
