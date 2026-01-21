/*
  Top navigation. No router for this MVP.
*/

import type { Screen } from '../types.ts'

export function TopNav(props: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  const { active, onNavigate } = props

  const items: { id: Screen; label: string }[] = [
    { id: 'status', label: 'Status' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3">
        <div className="mr-auto">
          <div className="text-sm font-semibold tracking-wide">OnlyTime</div>
          <div className="text-xs text-zinc-500">money, expressed as time</div>
        </div>

        <div className="flex gap-2">
          {items.map((it) => {
            const isActive = it.id === active
            return (
              <button
                key={it.id}
                type="button"
                className={
                  isActive
                    ? 'ot-btn ot-btn-primary'
                    : 'ot-btn'
                }
                onClick={() => onNavigate(it.id)}
              >
                {it.label}
              </button>
            )}
          )}
        </div>
      </div>
    </nav>
  )
}
