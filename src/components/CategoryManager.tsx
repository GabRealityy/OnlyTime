/*
  Category Management Modal
  Features:
  - Create/Edit/Delete custom categories
  - Emoji picker
  - Color picker
  - Category list with visual preview
*/

import { useState } from 'react'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import type { CustomCategory } from '../lib/expenses'
import { AVAILABLE_EMOJIS } from '../lib/expenses'





export function CategoryManager(props: {
  open: boolean
  onClose: () => void
  categories: CustomCategory[]
  onSave: (categories: CustomCategory[]) => void
}) {
  const { open, onClose, categories, onSave } = props

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📁')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const startEdit = (category: CustomCategory) => {
    setEditingId(category.id)
    setName(category.name)
    setEmoji(category.emoji || '📁')
  }

  const startNew = () => {
    setEditingId('new')
    setName('')
    setEmoji('📁')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmoji('📁')
  }

  const saveCategory = () => {
    if (!name.trim()) return

    let updatedCategories: CustomCategory[]

    if (editingId === 'new') {
      const newCategory: CustomCategory = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        emoji,
      }
      updatedCategories = [...categories, newCategory]
    } else {
      updatedCategories = categories.map(cat =>
        cat.id === editingId
          ? { ...cat, name: name.trim(), emoji }
          : cat
      )
    }

    onSave(updatedCategories)
    cancelEdit()
  }

  const deleteCategory = (id: string) => {
    const deletedCategory = categories.find(cat => cat.id === id)
    if (!deletedCategory) return

    onSave(categories.filter(cat => cat.id !== id))
    setCategoryToDelete(null)

    // Show toast with undo option (if showToast is available)
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(
        `Kategorie "${deletedCategory.name}" gelöscht`,
        'info',
        5000,
        'Rückgängig',
        () => {
          onSave([...categories, deletedCategory])
            ; (window as any).showToast(`Kategorie wiederhergestellt`, 'success', 2000)
        }
      )
    }
  }

  return (
    <Modal title="Kategorien verwalten" open={open} onClose={onClose}>
      <div className="space-y-4">
        {/* Category List */}
        <div className="space-y-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-secondary bg-input text-xl"
              >
                {cat.emoji || '📁'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{cat.name}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="ot-btn text-xs"
                  onClick={() => startEdit(cat)}
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  className="ot-btn ot-btn-danger text-xs"
                  onClick={() => setCategoryToDelete(cat.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="rounded-lg border border-border bg-page p-6 text-center text-sm text-secondary">
              Noch keine benutzerdefinierten Kategorien.
              <br />
              Erstelle deine erste Kategorie!
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editingId && (
          <div className="rounded-lg border-2 border-secondary bg-card p-4">
            <div className="mb-3 font-semibold">
              {editingId === 'new' ? 'Neue Kategorie' : 'Kategorie bearbeiten'}
            </div>

            <div className="space-y-3">
              {/* Name Input */}
              <div>
                <label htmlFor="cat-name" className="text-sm font-medium">
                  Name *
                </label>
                <input
                  id="cat-name"
                  placeholder="z.B. Hobby, Haustier, Geschenke"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="text-sm font-medium">Emoji</label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-secondary bg-card text-2xl hover:border-border"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    {emoji}
                  </button>
                  <span className="text-xs text-secondary">
                    Klicke um Emoji zu wählen
                  </span>
                </div>

                {showEmojiPicker && (
                  <div className="mt-2 grid grid-cols-8 gap-1 rounded-lg border border-border bg-card p-2">
                    {AVAILABLE_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded hover:bg-input text-xl"
                        onClick={() => {
                          setEmoji(em)
                          setShowEmojiPicker(false)
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>



              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="ot-btn ot-btn-primary flex-1"
                  onClick={saveCategory}
                  disabled={!name.trim()}
                >
                  Speichern
                </button>
                <button
                  type="button"
                  className="ot-btn"
                  onClick={cancelEdit}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Button */}
        {!editingId && (
          <button
            type="button"
            className="ot-btn ot-btn-primary w-full"
            onClick={startNew}
          >
            ➕ Neue Kategorie erstellen
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          className="ot-btn w-full"
          onClick={onClose}
        >
          Fertig
        </button>
      </div>

      <ConfirmDialog
        open={!!categoryToDelete}
        title="Kategorie löschen?"
        message="Diese Kategorie wird dauerhaft entfernt. Ausgaben mit dieser Kategorie bleiben erhalten, können aber nicht mehr gefiltert werden."
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        dangerous
        onConfirm={() => categoryToDelete && deleteCategory(categoryToDelete)}
        onCancel={() => setCategoryToDelete(null)}
      />
    </Modal>
  )
}
