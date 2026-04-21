import { useEffect, type ReactNode } from 'react'
import { StoreProvider } from '@/store/store'
import { useStore } from '@/store/hooks'
import { TopBar } from '@/components/TopBar'
import { StatusBar } from '@/components/StatusBar'
import { Toast } from '@/components/Toast'
import { CommandPalette } from '@/components/CommandPalette'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { HomePage } from '@/pages/Home'
import { ChatPage } from '@/pages/Chat'
import { SessionsPage } from '@/pages/Sessions'
import { SkillsPage } from '@/pages/Skills'
import { BackgroundPage } from '@/pages/Background'
import { SettingsPage } from '@/pages/Settings'

export function App(): ReactNode {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}

function AppShell(): ReactNode {
  const s = useStore()

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        s.openCmd()
      } else if (e.key === 'Escape' && s.state.commandOpen) {
        s.closeCmd()
      } else if (e.ctrlKey && e.key.toLowerCase() === 'b' && !e.metaKey) {
        e.preventDefault()
        s.toggleVoice()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [s])

  const route = s.state.route.name
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--paper-1)' }}>
      <TopBar />
      <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {route === 'home' && <HomePage />}
        {route === 'chat' && <ChatPage />}
        {route === 'sessions' && <SessionsPage />}
        {route === 'skills' && <SkillsPage />}
        {route === 'background' && <BackgroundPage />}
        {route === 'settings' && <SettingsPage />}
      </main>
      <StatusBar />
      {s.state.commandOpen && <CommandPalette />}
      <Toast />
      <OnboardingDialog />
    </div>
  )
}
