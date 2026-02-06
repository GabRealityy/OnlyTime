/*
  Onboarding System for First-Time Users
  Multi-phase introduction to OnlyTime concept
*/

import { useState } from 'react'
import { Modal } from './Modal'
import { formatCHF } from '../lib/money'

type OnboardingStep = 
  | 'welcome'
  | 'concept'
  | 'hourly-rate'
  | 'categories'
  | 'budgets'
  | 'quick-add'
  | 'complete'

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'concept',
  'hourly-rate',
  'categories',
  'budgets',
  'quick-add',
  'complete',
]

export function OnboardingFlow(props: {
  open: boolean
  onComplete: () => void
  onSkip: () => void
}) {
  const { open, onComplete, onSkip } = props
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')

  const stepIndex = STEP_ORDER.indexOf(currentStep)
  const isLastStep = currentStep === 'complete'
  const isFirstStep = currentStep === 'welcome'

  const goNext = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex < STEP_ORDER.length) {
      setCurrentStep(STEP_ORDER[nextIndex])
    } else {
      onComplete()
    }
  }

  const goBack = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEP_ORDER[prevIndex])
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold">Willkommen bei OnlyTime!</h2>
            <p className="text-tertiary">
              OnlyTime hilft dir, Geld als das zu verstehen, was es wirklich ist:
              <br />
              <span className="text-xl font-semibold text-primary mt-2 block">
                Deine Arbeitszeit
              </span>
            </p>
            <div className="rounded-xl border border-success bg-success-bg p-4 text-sm text-success">
              💡 Jeder Kauf kostet dich nicht nur CHF, sondern auch Stunden deiner Arbeit.
            </div>
          </div>
        )

      case 'concept':
        return (
          <div className="space-y-4">
            <div className="text-5xl mb-4 text-center">💰 ⇄ ⏱️</div>
            <h2 className="text-xl font-bold text-center">Das Konzept</h2>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-card p-3">
                <div className="font-semibold mb-1">1. Dein Stundenlohn</div>
                <p className="text-tertiary">
                  Wir berechnen, wie viel eine Stunde deiner Arbeitszeit wirklich wert ist
                  – inklusive Pendelzeit, Überstunden und Nebeneinkünfte.
                </p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <div className="font-semibold mb-1">2. Ausgaben = Zeit</div>
                <p className="text-tertiary">
                  Jede Ausgabe wird in Arbeitsstunden umgerechnet. Ein Kaffee für CHF 4.50
                  bei einem Stundenlohn von CHF 30 kostet dich 9 Minuten Arbeitszeit.
                </p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <div className="font-semibold mb-1">3. Bewusste Entscheidungen</div>
                <p className="text-tertiary">
                  Wenn du siehst, dass ein neues Handy 40 Stunden Arbeit kostet,
                  überlegst du vielleicht zweimal, ob es das wert ist.
                </p>
              </div>
            </div>
          </div>
        )

      case 'hourly-rate':
        return (
          <div className="space-y-4">
            <div className="text-5xl mb-4 text-center">📊</div>
            <h2 className="text-xl font-bold text-center">Stundenlohn einrichten</h2>
            <p className="text-tertiary text-sm text-center">
              Im nächsten Schritt richtest du deinen Stundenlohn ein.
            </p>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-tertiary">Monatseinkommen (Netto)</span>
                <span className="font-mono">CHF 5'000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-tertiary">Wochenarbeitszeit</span>
                <span className="font-mono">42 h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-tertiary">Pendelzeit pro Tag</span>
                <span className="font-mono">1 h</span>
              </div>
              <div className="h-px bg-secondary my-2"></div>
              <div className="flex justify-between font-semibold text-success">
                <span>Effektiver Stundenlohn</span>
                <span className="font-mono">CHF 24.50/h</span>
              </div>
            </div>
            <div className="text-xs text-secondary text-center">
              ℹ️ Du findest diese Einstellungen später unter "Einstellungen"
            </div>
          </div>
        )

      case 'categories':
        return (
          <div className="space-y-4">
            <div className="text-5xl mb-4 text-center">📁</div>
            <h2 className="text-xl font-bold text-center">Eigene Kategorien</h2>
            <p className="text-tertiary text-sm text-center">
              Erstelle deine eigenen Ausgabe-Kategorien mit Emoji und Farbe.
            </p>
            
            <div className="space-y-2">
              {[
                { emoji: '🐕', name: 'Haustier', color: '#f97316' },
                { emoji: '🎮', name: 'Gaming', color: '#a855f7' },
                { emoji: '🎁', name: 'Geschenke', color: '#ec4899' },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="font-medium">{cat.name}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-3 text-sm text-blue-300">
              💡 Kategorien helfen dir, deine Ausgaben zu organisieren und Budgets zu setzen.
            </div>
          </div>
        )

      case 'budgets':
        return (
          <div className="space-y-4">
            <div className="text-5xl mb-4 text-center">💰</div>
            <h2 className="text-xl font-bold text-center">Monatliche Budgets</h2>
            <p className="text-tertiary text-sm text-center">
              Setze Limits für einzelne Kategorien und erhalte Warnungen.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">☕ Kaffee & Snacks</span>
                  <span className="font-mono text-sm">CHF 80</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-input">
                  <div className="h-full bg-success" style={{ width: '60%' }}></div>
                </div>
                <div className="mt-1 text-xs text-secondary">
                  CHF 48 von CHF 80 (60%) – 🟢 Im Rahmen
                </div>
              </div>

              <div className="rounded-lg border border-warning bg-warning-bg p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">🍽️ Restaurant</span>
                  <span className="font-mono text-sm">CHF 200</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-input">
                  <div className="h-full bg-warning" style={{ width: '85%' }}></div>
                </div>
                <div className="mt-1 text-xs text-warning">
                  CHF 170 von CHF 200 (85%) – ⚠️ Warnung
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-warning bg-warning-bg p-3 text-sm text-warning">
              ⚠️ Ab 80% Auslastung wirst du gewarnt. Bei 100% wird es rot.
            </div>
          </div>
        )

      case 'quick-add':
        return (
          <div className="space-y-4">
            <div className="text-5xl mb-4 text-center">⚡</div>
            <h2 className="text-xl font-bold text-center">Quick-Add Buttons</h2>
            <p className="text-tertiary text-sm text-center">
              Erfasse häufige Ausgaben mit einem Klick – inkl. Zeitwert!
            </p>

            <div className="space-y-2">
              {[
                { emoji: '☕', title: 'Kaffee', chf: 4.5, time: '9 min' },
                { emoji: '🍽️', title: 'Mittagessen', chf: 15, time: '37 min' },
                { emoji: '🚌', title: 'ÖV-Ticket', chf: 3.4, time: '8 min' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full rounded-xl border-2 border-border bg-card p-3 text-left hover:border-secondary hover:bg-input transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{preset.emoji}</span>
                      <div>
                        <div className="font-medium">{preset.title}</div>
                        <div className="text-xs text-secondary">
                          {formatCHF(preset.chf)} • {preset.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-success bg-success-bg p-3 text-sm text-success">
              ✨ Spare Zeit bei der Erfassung wiederkehrender Ausgaben!
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">Alles bereit!</h2>
            <p className="text-tertiary">
              Du kennst jetzt die wichtigsten Features von OnlyTime.
            </p>
            
            <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Konzept verstanden: Geld = Arbeitszeit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Stundenlohn-Berechnung kennengerlernt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Kategorien & Budgets verstanden</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Quick-Add für schnelle Erfassung gesehen</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-3 text-sm text-blue-300">
              💡 Tipp: Richte zuerst deinen Stundenlohn ein, dann erfasse deine erste Ausgabe!
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      title={isFirstStep ? '' : `Schritt ${stepIndex + 1} von ${STEP_ORDER.length}`}
      open={open}
      onClose={() => {}}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        {!isFirstStep && (
          <div className="h-1 overflow-hidden rounded-full bg-input">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 pt-4">
          {!isFirstStep && !isLastStep && (
            <button
              type="button"
              className="ot-btn"
              onClick={goBack}
            >
              Zurück
            </button>
          )}
          
          <button
            type="button"
            className="ot-btn ot-btn-primary flex-1"
            onClick={isLastStep ? onComplete : goNext}
          >
            {isLastStep ? 'Los geht\'s!' : 'Weiter'}
          </button>

          {!isLastStep && (
            <button
              type="button"
              className="ot-btn text-xs"
              onClick={onSkip}
            >
              Überspringen
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
