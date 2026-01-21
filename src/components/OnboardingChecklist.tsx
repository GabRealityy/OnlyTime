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
}) {
  const { items, onItemClick } = props

  const completedCount = items.filter(item => item.completed).length
  const progress = (completedCount / items.length) * 100

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Erste Schritte</div>
        <div className="text-sm text-zinc-500">
          {completedCount} / {items.length}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800 mb-4">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
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
                ? 'border-emerald-800 bg-emerald-950/20'
                : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60'
            }`}
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                item.completed
                  ? 'bg-emerald-500 text-white'
                  : 'border-2 border-zinc-600'
              }`}>
                {item.completed && <span className="text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  item.completed ? 'text-emerald-400' : 'text-zinc-300'
                }`}>
                  {item.label}
                </div>
                {item.description && (
                  <div className="mt-1 text-xs text-zinc-500">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {completedCount === items.length && (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-center text-sm text-emerald-300">
          🎉 Geschafft! Du bist bereit, OnlyTime voll zu nutzen.
        </div>
      )}
    </div>
  )
}
