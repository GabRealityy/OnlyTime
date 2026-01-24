/*
  Top navigation. No router for this MVP.
*/

import type { Screen } from '../types.ts'
import AppLogo from '../assets/AppLogo_OnlyTime.svg'

// Minimalist SVG Icons (TR Style)
const Icons = {
  Status: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Reports: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  Help: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
}

export function TopNav(props: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  const { active, onNavigate } = props

  const items: { id: Screen; label: string; Icon: React.ComponentType; hideLabel?: boolean }[] = [
    { id: 'status', label: 'Status', Icon: Icons.Status },
    { id: 'reports', label: 'Berichte', Icon: Icons.Reports },
    { id: 'help', label: 'Hilfe', Icon: Icons.Help },
    { id: 'settings', label: 'Einstellungen', Icon: Icons.Settings, hideLabel: true },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div
          className="flex cursor-pointer items-center gap-8 transition-opacity hover:opacity-70"
          onClick={() => onNavigate('status')}
        >
          <img
            src={AppLogo}
            alt="OnlyTime"
            className="h-8 w-8 dark:invert"
          />
          <div className="text-2xl font-black tracking-tighter text-primary h-8 flex items-center">
            OnlyTime
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {items.map((it) => {
            const isActive = it.id === active
            return (
              <button
                key={it.id}
                type="button"
                className={`
                  flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-all
                  ${isActive
                    ? 'bg-primary text-primary-fg'
                    : 'text-secondary hover:text-primary hover:bg-input'}
                  ${it.hideLabel ? 'aspect-square p-2 bg-input ml-2' : ''}
                `}
                onClick={() => onNavigate(it.id)}
                aria-label={it.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`${it.hideLabel ? '' : 'sm:mr-2'} flex items-center`}>
                  <it.Icon />
                </div>
                {!it.hideLabel && <span className="hidden sm:inline">{it.label}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
