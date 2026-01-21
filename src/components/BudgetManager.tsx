/*
  Budget Management for Categories
  Features:
  - Set monthly budget per category
  - Visual progress bars
  - Warning indicators when approaching/exceeding budget
*/

import { useState } from 'react'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import type { CategoryBudget, CustomCategory } from '../lib/expenses'
import { expenseCategories } from '../lib/expenses'
import { formatCHF } from '../lib/money'

export function BudgetManager(props: {
  open: boolean
  onClose: () => void
  budgets: CategoryBudget[]
  customCategories: CustomCategory[]
  onSave: (budgets: CategoryBudget[]) => void
}) {
  const { open, onClose, budgets, customCategories, onSave } = props

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetToRemove, setBudgetToRemove] = useState<string | null>(null)

  const allCategories = [
    ...expenseCategories.map(cat => ({ id: cat, name: cat, emoji: undefined, color: undefined })),
    ...customCategories,
  ]

  const getBudget = (categoryId: string): CategoryBudget | undefined => {
    return budgets.find(b => b.categoryId === categoryId)
  }

  const startEdit = (categoryId: string) => {
    const existing = getBudget(categoryId)
    setEditingCategoryId(categoryId)
    setBudgetAmount(existing?.monthlyBudgetCHF?.toString() || '')
  }

  const saveBudget = () => {
    if (!editingCategoryId) return

    const amount = Number(budgetAmount.replace(',', '.'))
    if (!Number.isFinite(amount) || amount < 0) return

    let updatedBudgets: CategoryBudget[]

    const existingIndex = budgets.findIndex(b => b.categoryId === editingCategoryId)

    if (existingIndex >= 0) {
      if (amount === 0) {
        // Remove budget if set to 0
        updatedBudgets = budgets.filter(b => b.categoryId !== editingCategoryId)
      } else {
        // Update existing
        updatedBudgets = budgets.map(b =>
          b.categoryId === editingCategoryId
            ? { ...b, monthlyBudgetCHF: amount }
            : b
        )
      }
    } else {
      if (amount > 0) {
        // Add new
        updatedBudgets = [...budgets, { categoryId: editingCategoryId, monthlyBudgetCHF: amount }]
      } else {
        updatedBudgets = budgets
      }
    }

    onSave(updatedBudgets)
    setEditingCategoryId(null)
    setBudgetAmount('')
  }

  const removeBudget = (categoryId: string) => {
    const deletedBudget = budgets.find(b => b.categoryId === categoryId)
    if (!deletedBudget) return
    
    onSave(budgets.filter(b => b.categoryId !== categoryId))
    setBudgetToRemove(null)
    
    // Show toast with undo option
    const categoryName = allCategories.find(c => c.id === categoryId)?.name || categoryId
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(
        `Budget für "${categoryName}" gelöscht`,
        'info',
        5000,
        'Rückgängig',
        () => {
          onSave([...budgets, deletedBudget])
          ;(window as any).showToast(`Budget wiederhergestellt`, 'success', 2000)
        }
      )
    }
  }

  return (
    <Modal title="Kategorie-Budgets" open={open} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Setze monatliche Budgets für einzelne Kategorien. Du wirst gewarnt, wenn du das Budget überschreitest.
        </p>

        {/* Budget List */}
        <div className="space-y-2">
          {allCategories.map(cat => {
            const budget = getBudget(cat.id)
            const isEditing = editingCategoryId === cat.id

            return (
              <div
                key={cat.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {cat.emoji && <span className="text-lg">{cat.emoji}</span>}
                    <span className="font-medium">{cat.name}</span>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      {budget ? (
                        <>
                          <span className="font-mono text-sm">{formatCHF(budget.monthlyBudgetCHF)}</span>
                          <button
                            type="button"
                            className="ot-btn text-xs"
                            onClick={() => startEdit(cat.id)}
                          >
                            Ändern
                          </button>
                          <button
                            type="button"
                            className="ot-btn ot-btn-danger text-xs"
                            onClick={() => setBudgetToRemove(cat.id)}
                          >
                            Entfernen
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="ot-btn text-xs"
                          onClick={() => startEdit(cat.id)}
                        >
                          Budget setzen
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="z.B. 200"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="ot-btn ot-btn-primary"
                      onClick={saveBudget}
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      className="ot-btn"
                      onClick={() => {
                        setEditingCategoryId(null)
                        setBudgetAmount('')
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {budgets.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
            Noch keine Budgets definiert.
            <br />
            Klicke auf "Budget setzen" bei einer Kategorie.
          </div>
        )}

        <button
          type="button"
          className="ot-btn w-full"
          onClick={onClose}
        >
          Fertig
        </button>
      </div>

      <ConfirmDialog
        open={!!budgetToRemove}
        title="Budget entfernen?"
        message="Das monatliche Budget für diese Kategorie wird gelöscht. Bisherige Ausgaben bleiben unverändert."
        confirmLabel="Entfernen"
        cancelLabel="Abbrechen"
        dangerous
        onConfirm={() => budgetToRemove && removeBudget(budgetToRemove)}
        onCancel={() => setBudgetToRemove(null)}
      />
    </Modal>
  )
}
