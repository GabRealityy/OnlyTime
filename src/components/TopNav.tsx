/*
  Top navigation. No router for this MVP.
*/

import type { Screen } from '../types.ts'
import AppLogo from '../assets/AppLogo_OnlyTime.svg'

export function TopNav(props: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  const { active, onNavigate } = props

  const items: { id: Screen; label: string; icon?: string }[] = [
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'calculator', label: 'Rechner', icon: '🧮' },
    { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
    { id: 'help', label: 'Hilfe', icon: '❓' },
  ]

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3">
        <div className="mr-auto flex items-center gap-3">
          <img 
            src={AppLogo} 
            alt="OnlyTime" 
            className="h-10 w-10 brightness-0 dark:brightness-0 dark:invert" 
          />
          <div>
            <div className="text-sm font-semibold tracking-wide">OnlyTime</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-500">Money means Time.</div>
          </div>
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
                    ? 'ot-btn ot-btn-primary text-sm'
                    : 'ot-btn text-sm'
                }
                onClick={() => onNavigate(it.id)}
                aria-label={it.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {it.icon && <span className="mr-1">{it.icon}</span>}
                <span className="hidden sm:inline">{it.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
