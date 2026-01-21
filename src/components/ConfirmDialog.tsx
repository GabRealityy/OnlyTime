/*
  Confirmation Dialog Component
  
  Used for confirming critical actions like deletions.
  Provides a modal with explanatory text and confirm/cancel actions.
*/

export type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  dangerous?: boolean
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    title,
    message,
    confirmLabel = 'Bestätigen',
    cancelLabel = 'Abbrechen',
    onConfirm,
    onCancel,
    dangerous = false,
  } = props

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 animate-in fade-in duration-300"
        onClick={onCancel}
      />
      <div className="relative mx-auto mt-20 w-[min(480px,calc(100%-24px))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="ot-card">
          <div className="mb-4">
            <div className="text-lg font-semibold">{title}</div>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {message}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="ot-btn"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={dangerous ? 'ot-btn ot-btn-danger' : 'ot-btn ot-btn-primary'}
              onClick={() => {
                onConfirm()
                onCancel()
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
