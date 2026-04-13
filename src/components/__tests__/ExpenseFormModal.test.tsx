import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { ExpenseFormModal } from '../ExpenseFormModal'
import { renderWithRepo } from '../../test/renderWithRepo'

describe('ExpenseFormModal', () => {
  it('submits the entered values on happy path', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithRepo(
      <ExpenseFormModal
        open
        hourlyRate={50}
        onSave={onSave}
        onClose={onClose}
      />,
    )

    const amount = screen.getByPlaceholderText('0.00')
    await user.type(amount, '42.50')

    const title = screen.getByPlaceholderText(/Mittagessen/i)
    await user.type(title, 'Mittagessen')

    await user.click(screen.getByRole('button', { name: /Speichern/ }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCHF: 42.5,
        title: 'Mittagessen',
        category: 'Essen',
      }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('blocks submit and shows errors when amount is empty', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithRepo(
      <ExpenseFormModal
        open
        hourlyRate={50}
        onSave={onSave}
        onClose={onClose}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Speichern/ }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText(/gültigen Betrag/i)).toBeInTheDocument()
    expect(screen.getByText(/Beschreibung eingeben/i)).toBeInTheDocument()
  })

  it('blocks submit when title is empty even with valid amount', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()

    const { container } = renderWithRepo(
      <ExpenseFormModal
        open
        hourlyRate={50}
        onSave={onSave}
        onClose={() => {}}
      />,
    )

    await user.type(screen.getByPlaceholderText('0.00'), '10')
    await user.click(screen.getByRole('button', { name: /Speichern/ }))

    expect(onSave).not.toHaveBeenCalled()
    expect(within(container).getByText(/Beschreibung eingeben/i)).toBeInTheDocument()
  })
})
