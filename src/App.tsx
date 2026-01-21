/*
  OnlyTime MVP.
  No backend. All persistence via localStorage.
*/

import { useMemo, useState } from 'react'
import type { Screen } from './types.ts'
import { TopNav } from './components/TopNav'
import { SettingsScreen } from './screens/SettingsScreen'
import { StatusScreen } from './screens/StatusScreen'
import { CalculatorScreen } from './screens/CalculatorScreen'
import { loadSettings, saveSettings } from './lib/settings'
import { storageKeys } from './lib/storage'
import { useLocalStorageState } from './hooks/useLocalStorageState'

export default function App() {
  const [screen, setScreen] = useState<Screen>('status')

  const [settings, setSettings] = useLocalStorageState(
    storageKeys.settings,
    loadSettings,
    saveSettings,
  )

  const content = useMemo(() => {
    switch (screen) {
      case 'settings':
        return <SettingsScreen settings={settings} onChange={setSettings} />
      case 'calculator':
        return <CalculatorScreen settings={settings} />
      case 'status':
      default:
        return <StatusScreen settings={settings} />
    }
  }, [screen, settings, setSettings])

  return (
    <div className="min-h-screen">
      <TopNav active={screen} onNavigate={setScreen} />

      <main className="mx-auto max-w-3xl px-3 py-4">
        {content}
        <footer className="mt-8 pb-6 text-center text-xs text-zinc-600">
          OnlyTime runs locally. Nothing leaves this device.
        </footer>
      </main>
    </div>
  )
}
