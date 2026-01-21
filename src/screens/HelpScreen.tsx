/*
  Help Screen with FAQ
  Explains core concepts and features
*/

import { useState } from 'react'

type FAQItem = {
  question: string
  answer: string | React.ReactNode
  category: 'basics' | 'hourly-rate' | 'categories' | 'budgets' | 'features'
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'basics',
    question: 'Was ist das Konzept von OnlyTime?',
    answer: (
      <>
        OnlyTime rechnet deine Ausgaben in <strong>Arbeitszeit</strong> um. Statt nur zu sehen,
        dass ein Kaffee CHF 4.50 kostet, siehst du, dass er dich z.B. 9 Minuten Lebenszeit kostet.
        Das macht Kaufentscheidungen bewusster.
      </>
    ),
  },
  {
    category: 'hourly-rate',
    question: 'Wie wird mein Stundenlohn berechnet?',
    answer: (
      <>
        Der <strong>effektive Stundenlohn</strong> berücksichtigt:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Monatseinkommen (Netto oder Brutto mit Steuerabzug)</li>
          <li>Wochenarbeitszeit inkl. Überstunden</li>
          <li>Pendelzeit (geht von deiner verfügbaren Zeit ab)</li>
          <li>Zusätzliche Einkommensquellen mit eigener Stundenangabe</li>
        </ul>
        <div className="mt-2 text-xs text-zinc-500">
          Formel: Gesamteinkommen ÷ (Arbeitsstunden + Pendelstunden)
        </div>
      </>
    ),
  },
  {
    category: 'hourly-rate',
    question: 'Warum zählt Pendelzeit mit?',
    answer: 'Pendelzeit ist unbezahlte Zeit, die du für deinen Job aufwendest. Sie verringert deinen effektiven Stundenlohn, weil du mehr Zeit investierst, als du bezahlt bekommst.',
  },
  {
    category: 'categories',
    question: 'Wozu dienen Kategorien?',
    answer: (
      <>
        Kategorien helfen dir:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Ausgaben zu organisieren (z.B. Food, Transport, Shopping)</li>
          <li>Budgets pro Kategorie zu setzen</li>
          <li>Zu sehen, wofür du am meisten Zeit/Geld ausgibst</li>
        </ul>
        Du kannst eigene Kategorien mit Emoji und Farbe erstellen.
      </>
    ),
  },
  {
    category: 'budgets',
    question: 'Wie funktionieren Budgets?',
    answer: (
      <>
        Du kannst für jede Kategorie ein <strong>monatliches Budget</strong> in CHF festlegen.
        OnlyTime zeigt dir dann:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>🟢 <strong>Grün</strong>: Unter 80% – alles im Rahmen</li>
          <li>⚠️ <strong>Gelb</strong>: 80-99% – Warnung, bald erreicht</li>
          <li>🚫 <strong>Rot</strong>: ≥100% – Budget überschritten</li>
        </ul>
      </>
    ),
  },
  {
    category: 'budgets',
    question: 'Was bedeutet das rote Warnsymbol?',
    answer: 'Ein rotes 🚫 Symbol zeigt, dass du das monatliche Budget für eine Kategorie überschritten hast. Es ist keine Blockade, sondern ein Hinweis, damit du bewusst entscheidest, ob weitere Ausgaben in dieser Kategorie sinnvoll sind.',
  },
  {
    category: 'features',
    question: 'Was sind Quick-Add Buttons?',
    answer: 'Quick-Add Buttons erlauben dir, häufige Ausgaben (wie Kaffee, Mittagessen, ÖV-Ticket) mit einem Klick zu erfassen. Jeder Button zeigt direkt den CHF-Betrag und die entsprechende Arbeitszeit an.',
  },
  {
    category: 'features',
    question: 'Kann ich Ausgaben in Stunden statt CHF eingeben?',
    answer: 'Ja! Im Eingabeformular kannst du zwischen CHF und Zeit (Stunden:Minuten) umschalten. Die App rechnet automatisch um, basierend auf deinem Stundenlohn.',
  },
  {
    category: 'features',
    question: 'Wie funktioniert der CSV-Import?',
    answer: (
      <>
        Der CSV-Import hat 3 Schritte:
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li><strong>Upload</strong>: CSV-Datei auswählen</li>
          <li><strong>Mapping</strong>: Spalten zuordnen (Datum, Betrag, Beschreibung)</li>
          <li><strong>Vorschau</strong>: Kontrollieren und importieren</li>
        </ol>
        <div className="mt-2">
          OnlyTime erkennt Kategorien automatisch (z.B. "Coop" → Food, "SBB" → Transport).
        </div>
      </>
    ),
  },
  {
    category: 'basics',
    question: 'Wo werden meine Daten gespeichert?',
    answer: (
      <>
        <strong>Alles lokal im Browser (localStorage).</strong> Keine Daten verlassen dein Gerät.
        Das bedeutet:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>✅ 100% Privatsphäre</li>
          <li>✅ Funktioniert offline</li>
          <li>⚠️ Bei Browser-Cache löschen gehen Daten verloren</li>
        </ul>
      </>
    ),
  },
]

const CATEGORIES = [
  { id: 'basics', label: 'Grundlagen', emoji: '💡' },
  { id: 'hourly-rate', label: 'Stundenlohn', emoji: '💰' },
  { id: 'categories', label: 'Kategorien', emoji: '📁' },
  { id: 'budgets', label: 'Budgets', emoji: '📊' },
  { id: 'features', label: 'Features', emoji: '✨' },
] as const

export function HelpScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('basics')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))

  const filteredItems = FAQ_ITEMS.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  )

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Hilfe & FAQ</div>
            <div className="mt-1 text-sm text-zinc-400">
              Häufige Fragen zu OnlyTime
            </div>
          </div>
          <div className="text-3xl">❓</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="ot-card">
        <div className="text-sm font-medium mb-3">Thema wählen</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`ot-btn text-sm ${
              selectedCategory === 'all' ? 'ot-btn-primary' : ''
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            Alle
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`ot-btn text-sm ${
                selectedCategory === cat.id ? 'ot-btn-primary' : ''
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="ot-card">
        <div className="space-y-2">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedItems.has(index)
            return (
              <div
                key={index}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full text-left p-4 hover:bg-zinc-800/60 transition"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium text-sm">{item.question}</div>
                    <div className="text-zinc-500 shrink-0">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 text-sm text-zinc-400">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact */}
      <div className="ot-card">
        <div className="text-sm font-medium mb-2">Weitere Fragen?</div>
        <p className="text-sm text-zinc-400 mb-3">
          Wenn du etwas nicht findest, kontaktiere uns gerne!
        </p>
        <button
          type="button"
          className="ot-btn ot-btn-primary w-full"
          onClick={() => alert('Feedback-Funktion noch nicht implementiert')}
        >
          📧 Feedback senden
        </button>
      </div>
    </div>
  )
}
