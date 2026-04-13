import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { BudgetManager } from '../BudgetManager'
import { ToastContainer } from '../Toast'
import { renderWithRepo } from '../../test/renderWithRepo'
import type { CategoryBudget } from '../../lib/expenseTypes'

describe('BudgetManager', () => {
  it('delete shows undo toast which restores the budget', async () => {
    const user = userEvent.setup()
    const initialBudgets: CategoryBudget[] = [
      { categoryId: 'Essen', monthlyBudgetCHF: 200 },
    ]
    const onSave = vi.fn()

    renderWithRepo(
      <>
        <BudgetManager
          open
          onClose={() => {}}
          budgets={initialBudgets}
          customCategories={[]}
          hourlyRate={0}
          onSave={onSave}
        />
        <ToastContainer />
      </>,
    )

    // Row header has "Essen"; the Entfernen button for that row
    const essenRow = screen.getByText('Essen').closest('div.rounded-lg')!
    await user.click(within(essenRow as HTMLElement).getByRole('button', { name: 'Entfernen' }))

    // Confirm dialog appears — second "Entfernen" is the confirm button
    const dialogTitle = await screen.findByText('Budget entfernen?')
    const dialog = dialogTitle.closest('.ot-card')!
    await user.click(within(dialog as HTMLElement).getByRole('button', { name: 'Entfernen' }))

    // First onSave call: budgets filtered (empty)
    expect(onSave).toHaveBeenNthCalledWith(1, [])

    // Toast with Rückgängig appears
    const undoBtn = await screen.findByRole('button', { name: 'Rückgängig' })
    await user.click(undoBtn)

    // Second onSave call: budget restored
    expect(onSave).toHaveBeenLastCalledWith([
      { categoryId: 'Essen', monthlyBudgetCHF: 200 },
    ])
  })
})
