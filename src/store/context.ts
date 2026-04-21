import { createContext } from 'react'
import type { HermesClient } from '@/client/hermes-client'
import type { AuthState } from '@/client/auth'
import type { Connectors, RouteName, Settings, StoreState } from '@/types'
import type { Action } from './reducer'

export interface StoreApi {
  state: StoreState
  dispatch: (action: Action) => void
  client: HermesClient
  auth: AuthState
  setApiKey: (key: string) => void

  navigate: (name: RouteName, params?: Record<string, string>) => void
  openCmd: () => void
  closeCmd: () => void
  toast: (msg: string) => void
  toggleVoice: () => void
  setRightPanel: (p: StoreState['rightPanel']) => void
  toggleLeftPanel: () => void

  newSession: () => string
  openSession: (id: string) => Promise<void>
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  sendMessage: (sessionId: string, text: string) => Promise<void>
  renameSession: (id: string, title: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  exportSession: (id: string) => Promise<string>

  toggleSkillPinned: (id: string) => Promise<void>
  toggleSkillInstalled: (id: string) => Promise<void>

  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  setConnector: (key: keyof Connectors, on: boolean) => void

  addBgTask: (prompt: string) => Promise<void>
  cancelBgTask: (id: string) => void
  removeBgTask: (id: string) => void
}

export const StoreCtx = createContext<StoreApi | null>(null)
