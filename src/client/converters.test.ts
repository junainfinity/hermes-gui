import { describe, expect, it } from 'vitest'
import { toolKind, wireMessagesToDomain, wireSkillToDomain } from './converters'
import type { WireMessage, WireSkill } from '@/types'

describe('toolKind', () => {
  it('maps well-known names', () => {
    expect(toolKind('terminal')).toBe('terminal')
    expect(toolKind('bash')).toBe('terminal')
    expect(toolKind('web_search')).toBe('web')
    expect(toolKind('file_edit')).toBe('file')
    expect(toolKind('github_pr')).toBe('github')
  })

  it('prefix-matches', () => {
    expect(toolKind('terminal_with_special_flags')).toBe('terminal')
    expect(toolKind('file_edit_v2')).toBe('file')
  })

  it('falls back to "other"', () => {
    expect(toolKind('quantum_flux')).toBe('other')
  })
})

describe('wireMessagesToDomain', () => {
  it('maps simple user + assistant pair', () => {
    const wire: WireMessage[] = [
      {
        id: 1,
        session_id: 's',
        role: 'user',
        content: 'hi',
        tool_call_id: null,
        tool_calls: null,
        tool_name: null,
        timestamp: 100,
        token_count: null,
        finish_reason: null,
        reasoning: null,
        reasoning_details: null,
      },
      {
        id: 2,
        session_id: 's',
        role: 'assistant',
        content: 'hello',
        tool_call_id: null,
        tool_calls: null,
        tool_name: null,
        timestamp: 101,
        token_count: 10,
        finish_reason: 'stop',
        reasoning: null,
        reasoning_details: null,
      },
    ]
    const out = wireMessagesToDomain(wire)
    expect(out).toHaveLength(2)
    expect(out[0]?.role).toBe('user')
    expect(out[0]?.text).toBe('hi')
    expect(out[1]?.role).toBe('assistant')
    expect(out[1]?.text).toBe('hello')
  })

  it('attaches tool_calls to the assistant message', () => {
    const wire: WireMessage[] = [
      {
        id: 1,
        session_id: 's',
        role: 'assistant',
        content: 'running it',
        tool_call_id: null,
        tool_calls: [
          {
            id: 'call_1',
            function: { name: 'terminal', arguments: '{"cmd":"ls"}' },
          },
        ],
        tool_name: null,
        timestamp: 100,
        token_count: null,
        finish_reason: 'tool_calls',
        reasoning: null,
        reasoning_details: null,
      },
      {
        id: 2,
        session_id: 's',
        role: 'tool',
        content: 'file1\nfile2',
        tool_call_id: 'call_1',
        tool_calls: null,
        tool_name: 'terminal',
        timestamp: 101,
        token_count: null,
        finish_reason: null,
        reasoning: null,
        reasoning_details: null,
      },
    ]
    const out = wireMessagesToDomain(wire)
    expect(out).toHaveLength(1) // tool message folded in
    expect(out[0]?.tools).toHaveLength(1)
    expect(out[0]?.tools?.[0]?.tool).toBe('terminal')
    expect(out[0]?.tools?.[0]?.call).toBe('ls')
  })

  it('preserves reasoning text when present', () => {
    const wire: WireMessage[] = [
      {
        id: 1,
        session_id: 's',
        role: 'assistant',
        content: 'out',
        tool_call_id: null,
        tool_calls: null,
        tool_name: null,
        timestamp: 100,
        token_count: null,
        finish_reason: 'stop',
        reasoning: 'thinking...',
        reasoning_details: null,
      },
    ]
    const out = wireMessagesToDomain(wire)
    expect(out[0]?.reasoning).toBe('thinking...')
  })
})

describe('wireSkillToDomain', () => {
  it('maps tapped → pinned', () => {
    const wire: WireSkill = {
      id: 'x',
      name: 'x',
      version: '1.0',
      author: 'a',
      category: 'dev',
      description: 'd',
      installed: true,
      path: null,
      tapped: true,
    }
    const out = wireSkillToDomain(wire)
    expect(out.pinned).toBe(true)
    expect(out.installed).toBe(true)
    expect(out.desc).toBe('d')
  })
})
