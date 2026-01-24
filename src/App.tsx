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
import { ImprintScreen } from './screens/ImprintScreen'
import { PrivacyScreen } from './screens/PrivacyScreen'
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
      case 'imprint':
        return <ImprintScreen onBack={() => setScreen('status')} />
      case 'privacy':
        return <PrivacyScreen onBack={() => setScreen('status')} />
      case 'status':
      default:
        return <StatusScreen settings={settings} onChange={setSettings} />
    }
  }, [screen, settings, setSettings])

  return (
    <div className="min-h-screen">
      <TopNav active={screen} onNavigate={setScreen} />

      <main className="mx-auto max-w-3xl px-3 py-4">
        {content}
        <footer className="mt-8 pb-12 flex flex-col items-center gap-4 border-t border-border pt-8">
          <div className="text-xs text-tertiary">
            OnlyTime runs locally. Nothing leaves this device.
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-tertiary">
            <button
              onClick={() => setScreen('imprint')}
              className="hover:text-primary transition-colors"
            >
              Impressum
            </button>
            <button
              onClick={() => setScreen('privacy')}
              className="hover:text-primary transition-colors"
            >
              Datenschutz
            </button>
          </div>
          <div className="text-[10px] text-tertiary">
            © 2026 Swiss Innovation Studios
          </div>
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
