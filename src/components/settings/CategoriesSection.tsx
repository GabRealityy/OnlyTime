import type { Settings } from '../../lib/settings'
import { CategoryManager } from '../CategoryManager'
import { BudgetManager } from '../BudgetManager'
import { hourlyRateCHF } from '../../lib/settings'
import { showToast } from '../Toast'

export function CategoriesSection(props: {
  settings: Settings
  onChange: (next: Settings) => void
  openCategoryManager: boolean
  setOpenCategoryManager: (open: boolean) => void
  openBudgetManager: boolean
  setOpenBudgetManager: (open: boolean) => void
}) {
  const {
    settings,
    onChange,
    openCategoryManager,
    setOpenCategoryManager,
    openBudgetManager,
    setOpenBudgetManager,
  } = props

  return (
    <div className="ot-card">
      <div className="text-lg font-semibold">Kategorien & Budgets</div>
      <div className="mt-1 text-sm text-secondary">
        Verwalte benutzerdefinierte Kategorien und setze monatliche Budgets
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          className="ot-btn ot-btn-primary w-full"
          onClick={() => setOpenCategoryManager(true)}
        >
          📁 Kategorien verwalten ({settings.customCategories.length})
        </button>

        <button
          type="button"
          className="ot-btn w-full"
          onClick={() => setOpenBudgetManager(true)}
        >
          💰 Budgets verwalten ({settings.categoryBudgets.length})
        </button>
      </div>

      <CategoryManager
        open={openCategoryManager}
        onClose={() => setOpenCategoryManager(false)}
        categories={settings.customCategories}
        onSave={(categories) => {
          onChange({ ...settings, customCategories: categories })
          showToast(`${categories.length} Kategorie(n) gespeichert`, 'success')
        }}
      />

      <BudgetManager
        open={openBudgetManager}
        onClose={() => setOpenBudgetManager(false)}
        budgets={settings.categoryBudgets}
        customCategories={settings.customCategories}
        hourlyRate={hourlyRateCHF(settings)}
        onSave={(budgets) => {
          onChange({ ...settings, categoryBudgets: budgets })
          showToast(`${budgets.length} Budget(s) gespeichert`, 'success')
        }}
      />
    </div>
  )
}
