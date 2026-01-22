/*
  OnlyTime MVP.
  No backend. All persistence via localStorage.
*/

import { useMemo, useState, useEffect } from 'react'
import type { Screen } from './types.ts'
import { TopNav } from './components/TopNav'
import { SettingsScreen } from './screens/SettingsScreen'
import { StatusScreen } from './screens/StatusScreen'
import { HelpScreen } from './screens/HelpScreen'
import { ReportsScreen } from './screens/ReportsScreen'
import { loadSettings, saveSettings } from './lib/settings'
import { storageKeys } from './lib/storage'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { ToastContainer, showToast } from './components/Toast'
import { OnboardingFlow } from './components/OnboardingFlow'

export default function App() {
  const [screen, setScreen] = useState<Screen>('status')
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [settings, setSettings] = useLocalStorageState(
    storageKeys.settings,
    loadSettings,
    saveSettings,
  )

  // Check if first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onlyTime_hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('onlyTime_hasSeenOnboarding', 'true')
    setShowOnboarding(false)
    showToast('Willkommen bei OnlyTime! \ud83c\udf89', 'success')
    // Navigate to settings to set up hourly rate
    setScreen('settings')
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem('onlyTime_hasSeenOnboarding', 'true')
    setShowOnboarding(false)
    showToast('Du kannst die Tour später unter Hilfe nachholen', 'info')
  }

  const content = useMemo(() => {
    switch (screen) {
      case 'settings':
        return <SettingsScreen settings={settings} onChange={setSettings} />
      case 'reports':
        return <ReportsScreen settings={settings} />
      case 'help':
        return <HelpScreen />
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

      <ToastContainer />
      <OnboardingFlow
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </div>
  )
}
