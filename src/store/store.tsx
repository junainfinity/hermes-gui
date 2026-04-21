import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { createInitialState, reducer } from './reducer'
import { loadPersisted, savePersisted, type PersistedState } from './persistence'
import { StoreCtx, type StoreApi } from './context'
import { HermesClient } from '@/client/hermes-client'
import { loadAuth, saveAuth, type AuthState } from '@/client/auth'
import { toolKind } from '@/client/converters'
import { BUILT_IN_SLASH_COMMANDS } from '@/lib/slash-commands'
import type {
  BgTask,
  Message,
  Profile,
  RouteName,
  Settings,
  WireConfig,
  WireProfile,
} from '@/types'

/** Map each UI Settings key that's writable server-side to its dotted config path. */
const SETTING_TO_CONFIG_PATH: Partial<Record<keyof Settings, string>> = {
  model: 'model.default',
  fallback: 'model.fallback',
  provider: 'model.provider',
  personality: 'personalities.default',
  compressionModel: 'auxiliary.compression.model',
}

function settingsFromConfig(cfg: WireConfig, base: Settings): Settings {
  const model = cfg.model as Record<string, unknown> | undefined
  const aux = cfg.auxiliary as { compression?: { model?: string } } | undefined
  const compression = cfg.compression as { threshold?: number; enabled?: boolean } | undefined
  const personalities = cfg.personalities as Record<string, string> | undefined

  return {
    ...base,
    model: typeof model?.default === 'string' ? model.default : base.model,
    fallback: typeof model?.fallback === 'string' ? model.fallback : base.fallback,
    provider: typeof model?.provider === 'string' ? model.provider : base.provider,
    personality:
      typeof personalities?.default === 'string' ? personalities.default : base.personality,
    compressionModel:
      typeof aux?.compression?.model === 'string' ? aux.compression.model : base.compressionModel,
    compressionThreshold:
      typeof compression?.threshold === 'number'
        ? Math.round(compression.threshold * 100)
        : base.compressionThreshold,
  }
}

function profileFromWire(wire: WireProfile): Profile {
  return {
    profile: wire.profile,
    displayName: wire.display_name,
    email: wire.email,
    providersConfigured: wire.providers_configured,
    activeProvider: wire.active_provider,
    activeModel: wire.active_model,
  }
}

export function StoreProvider({ children }: { children: ReactNode }): ReactNode {
  const persisted = useMemo<PersistedState>(() => loadPersisted(), [])
  const [state, dispatch] = useReducer(reducer, persisted, createInitialState)
  const authRef = useRef<AuthState>(loadAuth())
  const clientRef = useRef<HermesClient>(new HermesClient(authRef.current))

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    document.body.classList.toggle('dark', state.settings.dark)
  }, [state.settings.dark])

  useEffect(() => {
    savePersisted({
      activeSessionId: state.activeSessionId,
      openTabs: state.openTabs,
      pinnedSessionIds: state.sessions.filter((s) => s.pinned).map((s) => s.id),
      archivedSessionIds: state.sessions.filter((s) => s.archived).map((s) => s.id),
      pinnedSkillIds: state.skills.filter((s) => s.pinned).map((s) => s.id),
      settings: state.settings,
      rightPanel: state.rightPanel,
      leftPanelCollapsed: state.leftPanelCollapsed,
    })
  }, [
    state.activeSessionId,
    state.openTabs,
    state.sessions,
    state.skills,
    state.settings,
    state.rightPanel,
    state.leftPanelCollapsed,
  ])

  // Surface installed skills as slash commands alongside the built-ins
  useEffect(() => {
    const skillCommands = state.skills
      .filter((sk) => sk.installed)
      .map((sk) => ({
        cmd: `/${sk.name}`,
        desc: sk.desc !== '' ? sk.desc : 'Run this skill',
      }))
    dispatch({
      type: 'SET_SLASH_COMMANDS',
      commands: [...BUILT_IN_SLASH_COMMANDS, ...skillCommands],
    })
  }, [state.skills])

  useEffect(() => {
    const client = clientRef.current
    const auth = authRef.current
    if (!auth.apiKey) {
      dispatch({
        type: 'BOOT_ERROR',
        error: 'Missing API key. Paste it in Settings → Account.',
      })
      return
    }

    const ac = new AbortController()
    void (async () => {
      try {
        dispatch({ type: 'BOOT_START' })
        await client.health()
         
        if (ac.signal.aborted) return

        const [models, skills, configRes, profileRes] = await Promise.all([
          client.listModels().catch(() => []),
          client.listSkills().catch(() => []),
          client.getConfig().catch(() => null as WireConfig | null),
          client.getProfile().catch(() => null as WireProfile | null),
        ])
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- set by cleanup
        if (ac.signal.aborted) return
        dispatch({ type: 'SET_MODELS', models })
        dispatch({ type: 'SET_SKILLS', skills })
        if (configRes) {
          const merged = settingsFromConfig(configRes, persisted.settings)
          ;(Object.keys(merged) as (keyof Settings)[]).forEach((k) => {
            if (merged[k] !== persisted.settings[k]) {
              dispatch({ type: 'SET_SETTING', key: k, value: merged[k] })
            }
          })
        }
        if (profileRes) {
          dispatch({ type: 'SET_PROFILE', profile: profileFromWire(profileRes) })
        }

        const result = await client
          .listSessions({ limit: 50 }, (id) => ({
            modelContextWindow: 200_000,
            live: false,
            pinned: persisted.pinnedSessionIds.includes(id),
            archived: persisted.archivedSessionIds.includes(id),
            skills: [],
            personality: persisted.settings.personality,
          }))
          .catch(() => ({ sessions: [], total: 0 }))
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- set by cleanup
        if (ac.signal.aborted) return
        dispatch({ type: 'SET_SESSIONS', sessions: result.sessions })
        dispatch({ type: 'BOOT_SUCCESS' })
      } catch (err) {
         
        if (ac.signal.aborted) return
        dispatch({
          type: 'BOOT_ERROR',
          error: err instanceof Error ? err.message : 'Failed to connect to Hermes',
        })
      }
    })()

    return () => {
      ac.abort()
    }
  }, [persisted])

  const setApiKey = useCallback((key: string) => {
    const next: AuthState = { ...authRef.current, apiKey: key }
    authRef.current = next
    clientRef.current = new HermesClient(next)
    saveAuth(next)
    window.location.reload()
  }, [])

  const api = useMemo<StoreApi>(() => {
    const client = clientRef.current

    const navigate = (name: RouteName, params?: Record<string, string>): void => {
      dispatch({ type: 'NAVIGATE', route: params ? { name, params } : { name } })
    }

    const toast = (msg: string): void => {
      const id = Date.now()
      dispatch({ type: 'SHOW_TOAST', msg })
      setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST', id })
      }, 2400)
    }

    const newSession = (): string => {
      const id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      const current = stateRef.current
      dispatch({
        type: 'UPSERT_SESSION',
        session: {
          id,
          title: 'new session',
          model: current.settings.model,
          personality: current.settings.personality,
          skills: current.skills.filter((s) => s.pinned).map((s) => s.id),
          pinned: false,
          archived: false,
          live: false,
          tokens: 0,
          cost: 0,
          contextPct: 0,
          msgCount: 0,
          updated: Date.now(),
          messages: [],
        },
      })
      dispatch({ type: 'OPEN_SESSION', id })
      return id
    }

    const openSession = async (id: string): Promise<void> => {
      dispatch({ type: 'OPEN_SESSION', id })
      try {
        const { messages } = await client.getSessionMessages(id, { limit: 500 })
        dispatch({
          type: 'UPDATE_SESSION',
          id,
          patch: { messages, msgCount: messages.length },
        })
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to load messages')
      }
    }

    const sendMessage = async (sessionId: string, text: string): Promise<void> => {
      const current = stateRef.current
      const userMsg: Message = { role: 'user', text, timestamp: Date.now() / 1000 }
      dispatch({ type: 'APPEND_MESSAGE', id: sessionId, message: userMsg })
      dispatch({
        type: 'APPEND_MESSAGE',
        id: sessionId,
        message: { role: 'assistant', text: '', timestamp: Date.now() / 1000 },
      })
      dispatch({ type: 'SET_SESSION_LIVE', id: sessionId, live: true })

      try {
        const { run_id } = await client.createRun({
          input: text,
          session_id: sessionId,
          reasoning_effort: current.settings.reasoning,
        })

        client.streamRun(run_id, {
          onDelta: (delta) => {
            dispatch({ type: 'STREAM_APPEND_DELTA', sessionId, delta })
          },
          onToolStart: (tool, preview) => {
            dispatch({
              type: 'STREAM_TOOL_START',
              sessionId,
              tool: toolKind(tool),
              call: preview ?? tool,
            })
          },
          onToolComplete: (tool, duration, error) => {
            dispatch({
              type: 'STREAM_TOOL_COMPLETE',
              sessionId,
              tool: toolKind(tool),
              duration,
              error,
            })
          },
          onComplete: (output, usage) => {
            dispatch({
              type: 'STREAM_FINAL',
              sessionId,
              output,
              totalTokens: usage.total_tokens,
            })
          },
          onError: (error) => {
            dispatch({ type: 'STREAM_ERROR', sessionId, error })
            dispatch({ type: 'SET_SESSION_LIVE', id: sessionId, live: false })
          },
        })
      } catch (err) {
        dispatch({ type: 'SET_SESSION_LIVE', id: sessionId, live: false })
        toast(err instanceof Error ? err.message : 'Failed to send message')
      }
    }

    const renameSession = async (id: string, title: string): Promise<void> => {
      await client.renameSession(id, title)
      dispatch({ type: 'UPDATE_SESSION', id, patch: { title } })
    }

    const deleteSession = async (id: string): Promise<void> => {
      await client.deleteSession(id)
      dispatch({ type: 'REMOVE_SESSION', id })
    }

    const exportSession = (id: string): Promise<string> => client.exportSession(id)

    const toggleSkillPinned = (id: string): Promise<void> => {
      // Skill pinning is UI-only; persisted via localStorage, not to config.yaml
      dispatch({ type: 'TOGGLE_SKILL_PINNED', id })
      return Promise.resolve()
    }

    const toggleSkillInstalled = async (id: string): Promise<void> => {
      const skill = stateRef.current.skills.find((s) => s.id === id)
      if (!skill) return
      try {
        if (skill.installed) {
          await client.uninstallSkill(id)
          dispatch({
            type: 'UPSERT_SKILL',
            skill: { ...skill, installed: false, pinned: false },
          })
          toast(`uninstalled ${skill.name}`)
        } else {
          await client.installSkill(id)
          // Refetch the full skill list so metadata is accurate
          const fresh = await client.listSkills()
          dispatch({ type: 'SET_SKILLS', skills: fresh })
          toast(`installed ${skill.name}`)
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to update skill')
      }
    }

    const addBgTask = async (prompt: string): Promise<void> => {
      const local: BgTask = {
        id: `bg_${Date.now().toString(36)}`,
        title: prompt.slice(0, 80),
        elapsed: 0,
        status: 'running',
        model: stateRef.current.settings.model,
      }
      dispatch({ type: 'ADD_BG_TASK', task: local })

      try {
        const { run_id } = await client.createRun({ input: prompt })
        dispatch({ type: 'UPDATE_BG_TASK', id: local.id, patch: { runId: run_id } })

        let output = ''
        client.streamRun(run_id, {
          onDelta: (delta) => {
            output += delta
          },
          onComplete: (final) => {
            dispatch({
              type: 'UPDATE_BG_TASK',
              id: local.id,
              patch: { status: 'done', output: final !== '' ? final : output },
            })
          },
          onError: (error) => {
            dispatch({
              type: 'UPDATE_BG_TASK',
              id: local.id,
              patch: { status: 'failed', error },
            })
          },
        })
      } catch (err) {
        dispatch({
          type: 'UPDATE_BG_TASK',
          id: local.id,
          patch: {
            status: 'failed',
            error: err instanceof Error ? err.message : 'launch failed',
          },
        })
      }
    }

    return {
      state,
      dispatch,
      client,
      auth: authRef.current,
      setApiKey,

      navigate,
      openCmd: () => {
        dispatch({ type: 'OPEN_CMD' })
      },
      closeCmd: () => {
        dispatch({ type: 'CLOSE_CMD' })
      },
      toast,
      toggleVoice: () => {
        dispatch({ type: 'TOGGLE_VOICE' })
      },
      setRightPanel: (p) => {
        dispatch({ type: 'SET_RIGHT_PANEL', panel: p })
      },
      toggleLeftPanel: () => {
        dispatch({ type: 'TOGGLE_LEFT_PANEL' })
      },

      newSession,
      openSession,
      closeTab: (id) => {
        dispatch({ type: 'CLOSE_TAB', id })
      },
      setActiveTab: (id) => {
        dispatch({ type: 'SET_ACTIVE_TAB', id })
      },
      sendMessage,
      renameSession,
      deleteSession,
      exportSession,

      toggleSkillPinned,
      toggleSkillInstalled,

      setSetting: (key, value) => {
        dispatch({ type: 'SET_SETTING', key, value })
      },
      setConnector: (key, on) => {
        dispatch({ type: 'SET_CONNECTOR', key, on })
      },
      patchSetting: async (key, value) => {
        // Optimistic update locally
        dispatch({ type: 'SET_SETTING', key, value })
        const path = SETTING_TO_CONFIG_PATH[key]
        let wirePath: string | null = path ?? null
        let wireValue: unknown = value
        // compressionThreshold needs unit conversion: UI 30-90 → config 0.30-0.90
        if (key === 'compressionThreshold' && typeof value === 'number') {
          wirePath = 'compression.threshold'
          wireValue = Math.round((value / 100) * 100) / 100
        }
        if (!wirePath) return
        try {
          await client.patchConfig({ [wirePath]: wireValue })
        } catch (err) {
          toast(err instanceof Error ? err.message : 'Failed to save setting')
        }
      },

      addBgTask,
      cancelBgTask: (id) => {
        dispatch({ type: 'UPDATE_BG_TASK', id, patch: { status: 'cancelled' } })
      },
      removeBgTask: (id) => {
        dispatch({ type: 'REMOVE_BG_TASK', id })
      },
    }
  }, [state, setApiKey])

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}
