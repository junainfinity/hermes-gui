/**
 * localStorage persistence for UI-only state. Data that belongs to Hermes
 * (sessions, messages, skills) is NOT persisted here — it's fetched fresh on
 * load. Only client-side state (tabs, pins, theme, density) lives here.
 */

import type { Settings } from '@/types'

const STORAGE_KEY = 'hermes-webui-state-v1'

export interface PersistedState {
  activeSessionId: string | null
  openTabs: string[]
  pinnedSessionIds: string[]
  archivedSessionIds: string[]
  pinnedSkillIds: string[]
  settings: Settings
  rightPanel: 'tools' | 'inspector' | 'hidden'
  leftPanelCollapsed: boolean
}

export const DEFAULT_PERSISTED: PersistedState = {
  activeSessionId: null,
  openTabs: [],
  pinnedSessionIds: [],
  archivedSessionIds: [],
  pinnedSkillIds: [],
  settings: {
    model: '',
    personality: 'concise',
    reasoning: 'high',
    fallback: '',
    provider: '',
    compressionThreshold: 50,
    compressionModel: '',
    temperature: 0.7,
    dailyBudget: 5,
    dark: false,
    density: 'cozy',
    connectors: {
      terminal: true,
      web: true,
      files: true,
      github: true,
      slack: false,
      gmail: false,
    },
  },
  rightPanel: 'tools',
  leftPanelCollapsed: false,
}

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PERSISTED
    const saved = JSON.parse(raw) as Partial<PersistedState>
    return {
      ...DEFAULT_PERSISTED,
      ...saved,
      settings: {
        ...DEFAULT_PERSISTED.settings,
        ...(saved.settings ?? {}),
        connectors: {
          ...DEFAULT_PERSISTED.settings.connectors,
          ...(saved.settings?.connectors ?? {}),
        },
      },
    }
  } catch {
    return DEFAULT_PERSISTED
  }
}

export function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota or private mode — silently ignore
  }
}
