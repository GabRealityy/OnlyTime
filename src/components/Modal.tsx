/*
  Tiny modal component. Kept minimal for the MVP.
*/

import { useEffect } from 'react'

export function Modal(props: {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const { title, open, onClose, children } = props

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-20 w-[min(560px,calc(100%-24px))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="ot-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold">{title}</div>
              <div className="mt-1 text-xs text-secondary">
                Press <span className="ot-kbd">Esc</span> to close.
              </div>
            </div>
            <button type="button" className="ot-btn" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
