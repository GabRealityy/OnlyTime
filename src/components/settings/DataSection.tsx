import { useState } from 'react'
import type { Settings } from '../../lib/settings'
import { ConfirmDialog } from '../ConfirmDialog'
import { Modal } from '../Modal'
import { showToast } from '../Toast'
import { clearAllData } from '../../lib/storage'
import { generateDummyData } from '../../lib/dummyData'

export function DataSection(props: { settings: Settings }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmDummyData, setShowConfirmDummyData] = useState(false)
  const [dummyDataMonths, setDummyDataMonths] = useState<number>(12)

  return (
    <>
      <div className="ot-card border-danger bg-danger-bg">
        <div className="text-lg font-semibold text-danger">Gefahrenzone</div>
        <div className="mt-1 text-sm text-secondary">
          Lösche alle Einstellungen und Ausgaben dauerhaft
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="ot-btn w-full border-warning text-warning hover:bg-warning-bg"
            onClick={() => setShowConfirmDummyData(true)}
          >
            🎲 Dummy-Daten laden
          </button>

          <button
            type="button"
            className="ot-btn ot-btn-danger w-full"
            onClick={() => setShowConfirmReset(true)}
          >
            🗑️ Alle Daten löschen
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmReset}
        title="Alle Daten löschen?"
        message="Bist du sicher? Dies löscht alle deine Ausgaben und Einstellungen unwiderruflich. Die App wird danach neu geladen."
        confirmLabel="Ja, alles löschen"
        cancelLabel="Abbrechen"
        dangerous
        onConfirm={() => {
          clearAllData()
          window.location.reload()
        }}
        onCancel={() => setShowConfirmReset(false)}
      />

      <Modal
        title="Dummy-Daten laden"
        open={showConfirmDummyData}
        onClose={() => setShowConfirmDummyData(false)}
      >
        <p className="text-sm text-secondary mb-4">
          Dies erstellt realistische Beispiel-Ausgaben für Tests und Demonstrationen.
          <strong className="block mt-2 text-warning">
            ⚠️ Warnung: Vorhandene Ausgaben werden überschrieben!
          </strong>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Zeitraum wählen:</label>
          <div className="space-y-2">
            {[3, 6, 12, 24, 60].map((months) => (
              <label key={months} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dummyDataMonths"
                  checked={dummyDataMonths === months}
                  onChange={() => setDummyDataMonths(months)}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  {months === 3 && '3 Monate'}
                  {months === 6 && '6 Monate'}
                  {months === 12 && '1 Jahr (12 Monate)'}
                  {months === 24 && '2 Jahre (24 Monate)'}
                  {months === 60 && '5 Jahre (60 Monate)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="ot-btn flex-1"
            onClick={() => setShowConfirmDummyData(false)}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="ot-btn ot-btn-primary flex-1"
            onClick={() => {
              const count = generateDummyData(props.settings, dummyDataMonths)
              setShowConfirmDummyData(false)
              showToast(
                `${count} Dummy-Ausgaben für ${dummyDataMonths} Monate erstellt`,
                'success',
                3000,
              )
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }}
          >
            Laden
          </button>
        </div>
      </Modal>
    </>
  )
}
