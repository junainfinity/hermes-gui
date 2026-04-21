import { describe, expect, it } from 'vitest'
import { createInitialState, reducer, type Action } from './reducer'
import type { Session } from '@/types'

const baseSession: Session = {
  id: 's1',
  title: 'test',
  model: 'sonnet',
  personality: 'concise',
  skills: [],
  pinned: false,
  archived: false,
  live: false,
  tokens: 0,
  cost: 0,
  contextPct: 0,
  msgCount: 0,
  updated: 0,
  messages: [],
}

function run(actions: Action[]) {
  let state = createInitialState()
  for (const a of actions) state = reducer(state, a)
  return state
}

describe('reducer', () => {
  it('opens a session and creates a tab', () => {
    const state = run([
      { type: 'UPSERT_SESSION', session: baseSession },
      { type: 'OPEN_SESSION', id: 's1' },
    ])
    expect(state.activeSessionId).toBe('s1')
    expect(state.openTabs).toContain('s1')
    expect(state.route.name).toBe('chat')
  })

  it('closes a tab and falls back', () => {
    const state = run([
      { type: 'UPSERT_SESSION', session: baseSession },
      { type: 'UPSERT_SESSION', session: { ...baseSession, id: 's2' } },
      { type: 'OPEN_SESSION', id: 's1' },
      { type: 'OPEN_SESSION', id: 's2' },
      { type: 'CLOSE_TAB', id: 's2' },
    ])
    expect(state.openTabs).toEqual(['s1'])
    expect(state.activeSessionId).toBe('s1')
  })

  it('appends streaming deltas to last assistant message', () => {
    const state = run([
      { type: 'UPSERT_SESSION', session: baseSession },
      {
        type: 'APPEND_MESSAGE',
        id: 's1',
        message: { role: 'assistant', text: '' },
      },
      { type: 'STREAM_APPEND_DELTA', sessionId: 's1', delta: 'Hel' },
      { type: 'STREAM_APPEND_DELTA', sessionId: 's1', delta: 'lo' },
    ])
    const sess = state.sessions[0]
    expect(sess?.messages[0]?.text).toBe('Hello')
  })

  it('records tool start and matches tool complete to the same call', () => {
    const state = run([
      { type: 'UPSERT_SESSION', session: baseSession },
      {
        type: 'APPEND_MESSAGE',
        id: 's1',
        message: { role: 'assistant', text: '' },
      },
      { type: 'STREAM_TOOL_START', sessionId: 's1', tool: 'terminal', call: 'ls' },
      {
        type: 'STREAM_TOOL_COMPLETE',
        sessionId: 's1',
        tool: 'terminal',
        duration: 0.42,
        error: false,
      },
    ])
    const tools = state.sessions[0]?.messages[0]?.tools
    expect(tools).toHaveLength(1)
    expect(tools?.[0]?.dur).toBe(0.42)
    expect(tools?.[0]?.error).toBe(false)
  })

  it('toggles skill pinned', () => {
    const state = run([
      {
        type: 'SET_SKILLS',
        skills: [
          {
            id: 'x',
            name: 'x',
            desc: '',
            installed: true,
            pinned: false,
            version: '1',
            author: 'a',
            category: 'dev',
          },
        ],
      },
      { type: 'TOGGLE_SKILL_PINNED', id: 'x' },
    ])
    expect(state.skills[0]?.pinned).toBe(true)
  })

  it('SET_SETTING updates a specific key', () => {
    const state = run([
      { type: 'SET_SETTING', key: 'dark', value: true },
      { type: 'SET_SETTING', key: 'temperature', value: 0.3 },
    ])
    expect(state.settings.dark).toBe(true)
    expect(state.settings.temperature).toBe(0.3)
  })

  it('SET_CONNECTOR only touches that key', () => {
    const state = run([{ type: 'SET_CONNECTOR', key: 'slack', on: true }])
    expect(state.settings.connectors.slack).toBe(true)
    expect(state.settings.connectors.terminal).toBe(true) // default preserved
  })
})
