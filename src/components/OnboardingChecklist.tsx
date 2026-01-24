/*
  Onboarding Checklist Component
  Shows progress of setup tasks
*/

export type ChecklistItem = {
  id: string
  label: string
  completed: boolean
  description?: string
}

export function OnboardingChecklist(props: {
  items: ChecklistItem[]
  onItemClick?: (id: string) => void
  onDismiss?: () => void
}) {
  const { items, onItemClick, onDismiss } = props

  const completedCount = items.filter(item => item.completed).length
  const progress = (completedCount / items.length) * 100

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Erste Schritte</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-secondary">
            {completedCount} / {items.length}
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-secondary hover:text-primary transition-colors p-1"
              title="Checkliste ausblenden"
              aria-label="Checkliste ausblenden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-input mb-4">
        <div
          className="h-full bg-success transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`w-full text-left rounded-lg border p-3 transition ${
              item.completed
                ? 'border-success bg-success-bg'
                : 'border-border bg-card hover:bg-input'
            }`}
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                item.completed
                  ? 'bg-success text-primary-inverse'
                  : 'border-2 border-secondary'
              }`}>
                {item.completed && <span className="text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  item.completed ? 'text-success' : 'text-primary'
                }`}>
                  {item.label}
                </div>
                {item.description && (
                  <div className="mt-1 text-xs text-secondary">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {completedCount === items.length && (
        <div className="mt-4 rounded-lg border border-success bg-success-bg p-3 text-center text-sm text-success">
          🎉 Geschafft! Du bist bereit, OnlyTime voll zu nutzen.
        </div>
      )}
    </div>
  )
}
