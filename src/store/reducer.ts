/**
 * Pure reducer for the Hermes Web UI. All side effects live in
 * `src/store/store.tsx`.
 */

import type {
  BgTask,
  Message,
  Model,
  Personality,
  Route,
  RouteName,
  Session,
  Settings,
  Skill,
  SlashCommand,
  StoreState,
  Toast,
  ToolCall,
  ToolKind,
} from '@/types'
import { DEFAULT_PERSISTED, type PersistedState } from './persistence'

export type Action =
  | { type: 'BOOT_START' }
  | { type: 'BOOT_SUCCESS' }
  | { type: 'BOOT_ERROR'; error: string }
  | { type: 'NAVIGATE'; route: Route }
  | { type: 'OPEN_CMD' }
  | { type: 'CLOSE_CMD' }
  | { type: 'SHOW_TOAST'; msg: string }
  | { type: 'HIDE_TOAST'; id: number }
  | { type: 'TOGGLE_VOICE' }
  | { type: 'SET_RIGHT_PANEL'; panel: StoreState['rightPanel'] }
  | { type: 'TOGGLE_LEFT_PANEL' }
  | { type: 'SET_SESSIONS'; sessions: Session[] }
  | { type: 'UPSERT_SESSION'; session: Session }
  | { type: 'UPDATE_SESSION'; id: string; patch: Partial<Session> }
  | { type: 'REMOVE_SESSION'; id: string }
  | { type: 'OPEN_SESSION'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'APPEND_MESSAGE'; id: string; message: Message }
  | { type: 'SET_SESSION_LIVE'; id: string; live: boolean }
  | { type: 'STREAM_APPEND_DELTA'; sessionId: string; delta: string }
  | { type: 'STREAM_TOOL_START'; sessionId: string; tool: ToolKind; call: string }
  | { type: 'STREAM_TOOL_COMPLETE'; sessionId: string; tool: ToolKind; duration: number; error: boolean }
  | { type: 'STREAM_FINAL'; sessionId: string; output: string; totalTokens: number }
  | { type: 'STREAM_ERROR'; sessionId: string; error: string }
  | { type: 'SET_SKILLS'; skills: Skill[] }
  | { type: 'UPSERT_SKILL'; skill: Skill }
  | { type: 'TOGGLE_SKILL_PINNED'; id: string }
  | { type: 'SET_MODELS'; models: Model[] }
  | { type: 'SET_PERSONALITIES'; personalities: Personality[] }
  | { type: 'SET_SLASH_COMMANDS'; commands: SlashCommand[] }
  | { type: 'SET_SETTING'; key: keyof Settings; value: Settings[keyof Settings] }
  | { type: 'SET_CONNECTOR'; key: keyof Settings['connectors']; on: boolean }
  | { type: 'ADD_BG_TASK'; task: BgTask }
  | { type: 'UPDATE_BG_TASK'; id: string; patch: Partial<BgTask> }
  | { type: 'REMOVE_BG_TASK'; id: string }

export function createInitialState(persisted: PersistedState = DEFAULT_PERSISTED): StoreState {
  return {
    route: { name: 'home' },
    activeSessionId: persisted.activeSessionId,
    openTabs: persisted.openTabs,
    sessions: [],
    skills: [],
    bgTasks: [],
    models: [],
    personalities: [],
    slashCommands: [],
    settings: persisted.settings,
    commandOpen: false,
    voiceOn: false,
    rightPanel: persisted.rightPanel,
    leftPanelCollapsed: persisted.leftPanelCollapsed,
    toast: null,
    bootLoading: true,
    bootError: null,
  }
}

export function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'BOOT_START':
      return { ...state, bootLoading: true, bootError: null }
    case 'BOOT_SUCCESS':
      return { ...state, bootLoading: false, bootError: null }
    case 'BOOT_ERROR':
      return { ...state, bootLoading: false, bootError: action.error }

    case 'NAVIGATE':
      return { ...state, route: action.route, commandOpen: false }

    case 'OPEN_CMD':
      return { ...state, commandOpen: true }
    case 'CLOSE_CMD':
      return { ...state, commandOpen: false }

    case 'SHOW_TOAST':
      return { ...state, toast: { msg: action.msg, id: Date.now() } satisfies Toast }
    case 'HIDE_TOAST':
      return state.toast?.id === action.id ? { ...state, toast: null } : state

    case 'TOGGLE_VOICE':
      return { ...state, voiceOn: !state.voiceOn }
    case 'SET_RIGHT_PANEL':
      return { ...state, rightPanel: action.panel }
    case 'TOGGLE_LEFT_PANEL':
      return { ...state, leftPanelCollapsed: !state.leftPanelCollapsed }

    case 'SET_SESSIONS':
      return { ...state, sessions: action.sessions }

    case 'UPSERT_SESSION': {
      const idx = state.sessions.findIndex((s) => s.id === action.session.id)
      if (idx < 0) return { ...state, sessions: [action.session, ...state.sessions] }
      const next = [...state.sessions]
      next[idx] = action.session
      return { ...state, sessions: next }
    }

    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, ...action.patch, updated: Date.now() } : s,
        ),
      }

    case 'REMOVE_SESSION': {
      const tabs = state.openTabs.filter((t) => t !== action.id)
      const firstRemaining = state.sessions.find((s) => s.id !== action.id)
      const active =
        state.activeSessionId === action.id
          ? tabs[0] ?? firstRemaining?.id ?? null
          : state.activeSessionId
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.id),
        openTabs: tabs,
        activeSessionId: active,
      }
    }

    case 'OPEN_SESSION': {
      const tabs = state.openTabs.includes(action.id)
        ? state.openTabs
        : [...state.openTabs, action.id]
      return {
        ...state,
        activeSessionId: action.id,
        openTabs: tabs,
        route: { name: 'chat' satisfies RouteName },
        commandOpen: false,
      }
    }

    case 'SET_ACTIVE_TAB':
      return { ...state, activeSessionId: action.id }

    case 'CLOSE_TAB': {
      const tabs = state.openTabs.filter((t) => t !== action.id)
      const fallback = tabs[tabs.length - 1] ?? state.sessions[0]?.id ?? null
      const active = state.activeSessionId === action.id ? fallback : state.activeSessionId
      return { ...state, openTabs: tabs, activeSessionId: active }
    }

    case 'APPEND_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.id) return s
          return {
            ...s,
            messages: [...s.messages, action.message],
            msgCount: s.msgCount + 1,
            updated: Date.now(),
          }
        }),
      }

    case 'SET_SESSION_LIVE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, live: action.live } : s,
        ),
      }

    case 'STREAM_APPEND_DELTA':
      return patchLastAssistantMessage(state, action.sessionId, (msg) => ({
        ...msg,
        text: msg.text + action.delta,
      }))

    case 'STREAM_TOOL_START':
      return patchLastAssistantMessage(state, action.sessionId, (msg) => {
        const tools = [...(msg.tools ?? [])]
        tools.push({ tool: action.tool, call: action.call })
        return { ...msg, tools }
      })

    case 'STREAM_TOOL_COMPLETE':
      return patchLastAssistantMessage(state, action.sessionId, (msg) => {
        const tools = [...(msg.tools ?? [])]
        for (let i = tools.length - 1; i >= 0; i--) {
          const t = tools[i]
          if (t?.tool === action.tool && t.dur === undefined) {
            tools[i] = { ...t, dur: action.duration, error: action.error }
            break
          }
        }
        return { ...msg, tools }
      })

    case 'STREAM_FINAL':
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.sessionId) return s
          const msgs = [...s.messages]
          const last = msgs[msgs.length - 1]
          if (last?.role === 'assistant') {
            msgs[msgs.length - 1] = {
              ...last,
              text: action.output !== '' ? action.output : last.text,
            }
          }
          return {
            ...s,
            messages: msgs,
            tokens: action.totalTokens,
            live: false,
            updated: Date.now(),
          }
        }),
      }

    case 'STREAM_ERROR':
      return patchLastAssistantMessage(state, action.sessionId, (msg) => ({
        ...msg,
        text: msg.text !== '' ? msg.text : `⚠️ ${action.error}`,
      }))

    case 'SET_SKILLS':
      return { ...state, skills: action.skills }

    case 'UPSERT_SKILL': {
      const idx = state.skills.findIndex((s) => s.id === action.skill.id)
      if (idx < 0) return { ...state, skills: [action.skill, ...state.skills] }
      const next = [...state.skills]
      next[idx] = action.skill
      return { ...state, skills: next }
    }

    case 'TOGGLE_SKILL_PINNED':
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.id === action.id ? { ...s, pinned: !s.pinned } : s,
        ),
      }

    case 'SET_MODELS':
      return { ...state, models: action.models }
    case 'SET_PERSONALITIES':
      return { ...state, personalities: action.personalities }
    case 'SET_SLASH_COMMANDS':
      return { ...state, slashCommands: action.commands }

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }

    case 'SET_CONNECTOR':
      return {
        ...state,
        settings: {
          ...state.settings,
          connectors: { ...state.settings.connectors, [action.key]: action.on },
        },
      }

    case 'ADD_BG_TASK':
      return { ...state, bgTasks: [action.task, ...state.bgTasks] }

    case 'UPDATE_BG_TASK':
      return {
        ...state,
        bgTasks: state.bgTasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      }

    case 'REMOVE_BG_TASK':
      return { ...state, bgTasks: state.bgTasks.filter((t) => t.id !== action.id) }
  }
}

function patchLastAssistantMessage(
  state: StoreState,
  sessionId: string,
  patch: (msg: Message) => Message,
): StoreState {
  return {
    ...state,
    sessions: state.sessions.map((s) => {
      if (s.id !== sessionId) return s
      const msgs = [...s.messages]
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i]
        if (m?.role === 'assistant') {
          msgs[i] = patch(m)
          return { ...s, messages: msgs, updated: Date.now() }
        }
      }
      return s
    }),
  }
}

// Exported for tests
export const _internal = { patchLastAssistantMessage } satisfies Record<string, unknown>
export type { ToolCall }
