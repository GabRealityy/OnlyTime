/*
  Simple Toast Notification System
  Features:
  - Auto-dismiss after configurable duration
  - Success, Error, Info types
  - Slide-in animation
  - Stack multiple toasts
*/

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
}

let toastListeners: Array<(toast: Toast) => void> = []
let toastIdCounter = 0

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const toast: Toast = {
    id: `toast-${++toastIdCounter}`,
    message,
    type,
    duration,
  }
  toastListeners.forEach(listener => listener(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.duration || 3000)
    }

    toastListeners.push(listener)

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-800 bg-emerald-950/90 text-emerald-200'
      case 'error':
        return 'border-rose-800 bg-rose-950/90 text-rose-200'
      case 'info':
      default:
        return 'border-zinc-800 bg-zinc-950/90 text-zinc-200'
    }
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✕'
      case 'info': default: return 'ℹ'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-xl border p-4 shadow-lg
            animate-slide-in-right
            ${getToastStyles(toast.type)}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg font-semibold">
              {getToastIcon(toast.type)}
            </span>
            <div className="flex-1 text-sm">
              {toast.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
