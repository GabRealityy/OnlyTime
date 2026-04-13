import { useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { showToast } from '../components/Toast'
import { OnboardingChecklist, type ChecklistItem } from '../components/OnboardingChecklist'
import { useExpenseRepo } from '../contexts/RepoContext'
import { monthKeyFromDate } from '../lib/date'
import { DisplaySection } from '../components/settings/DisplaySection'
import { IncomeSection } from '../components/settings/IncomeSection'
import { RateSection } from '../components/settings/RateSection'
import { QuickAddSection } from '../components/settings/QuickAddSection'
import { CategoriesSection } from '../components/settings/CategoriesSection'
import { DataSection } from '../components/settings/DataSection'

export function SettingsScreen(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props

  const [openCategoryManager, setOpenCategoryManager] = useState(false)
  const [openBudgetManager, setOpenBudgetManager] = useState(false)

  const repo = useExpenseRepo()
  const hourlyRate = hourlyRateCHF(settings)

  const checklistItems: ChecklistItem[] = [
    {
      id: 'hourly-rate',
      label: 'Stundenlohn einrichten',
      description: 'Monatseinkommen und Arbeitszeit angeben',
      completed: hourlyRate > 0,
    },
    {
      id: 'category',
      label: 'Erste eigene Kategorie anlegen',
      description: 'Individuelle Ausgabenkategorie erstellen',
      completed: settings.customCategories.length > 0,
    },
    {
      id: 'budget',
      label: 'Erstes Budget festlegen',
      description: 'Monatliches Limit für eine Kategorie setzen',
      completed: settings.categoryBudgets.length > 0,
    },
    {
      id: 'expense',
      label: 'Erste Ausgabe erfassen',
      description: 'Ausgabe manuell oder per Quick-Add speichern',
      completed: repo.listMonth(monthKeyFromDate(new Date())).length > 0,
    },
  ]

  const handleChecklistClick = (id: string) => {
    switch (id) {
      case 'hourly-rate': {
        const incomeSection = document.querySelector('[data-section="income"]')
        if (incomeSection) {
          incomeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        break
      }
      case 'category':
        setOpenCategoryManager(true)
        break
      case 'budget':
        setOpenBudgetManager(true)
        break
      case 'expense':
        showToast('Gehe zum Status-Screen, um eine Ausgabe zu erfassen', 'info')
        break
    }
  }

  const handleDismissChecklist = () => {
    onChange({ ...settings, showOnboardingChecklist: false })
    showToast('Checkliste ausgeblendet', 'info')
  }

  return (
    <div className="space-y-4">
      <DisplaySection settings={settings} onChange={onChange} />

      {settings.showOnboardingChecklist && (
        <OnboardingChecklist
          items={checklistItems}
          onItemClick={handleChecklistClick}
          onDismiss={handleDismissChecklist}
        />
      )}

      <IncomeSection settings={settings} onChange={onChange} />
      <RateSection settings={settings} onChange={onChange} />
      <QuickAddSection settings={settings} onChange={onChange} />
      <CategoriesSection
        settings={settings}
        onChange={onChange}
        openCategoryManager={openCategoryManager}
        setOpenCategoryManager={setOpenCategoryManager}
        openBudgetManager={openBudgetManager}
        setOpenBudgetManager={setOpenBudgetManager}
      />
      <DataSection settings={settings} />
    </div>
  )
}
