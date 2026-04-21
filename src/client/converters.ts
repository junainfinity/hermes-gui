/**
 * Converters from wire types (as returned by Hermes' API server) to the
 * domain types the UI operates on.
 */

import type {
  Message,
  Session,
  Skill,
  ToolCall,
  ToolKind,
  WireMessage,
  WireSession,
  WireSkill,
  WireToolCall,
} from '@/types'

const TOOL_KIND_MAP: Record<string, ToolKind> = {
  terminal: 'terminal',
  bash: 'terminal',
  shell: 'terminal',
  exec: 'terminal',
  web_search: 'web',
  web_extract: 'web',
  web: 'web',
  browser: 'web',
  file_edit: 'file',
  file_read: 'file',
  file_write: 'file',
  file: 'file',
  github: 'github',
  github_issues: 'github',
  github_pr: 'github',
  search: 'search',
}

export function toolKind(name: string): ToolKind {
  const lower = name.toLowerCase()
  const exact = TOOL_KIND_MAP[lower]
  if (exact) return exact
  for (const [key, kind] of Object.entries(TOOL_KIND_MAP)) {
    if (lower.startsWith(key)) return kind
  }
  return 'other'
}

export function wireToolCallToDomain(call: WireToolCall): ToolCall {
  let summary = ''
  try {
    const args = JSON.parse(call.function.arguments) as Record<string, unknown>
    summary = stringifyArgs(args)
  } catch {
    summary = call.function.arguments.slice(0, 80)
  }
  return {
    tool: toolKind(call.function.name),
    call: summary,
  }
}

function stringifyArgs(args: Record<string, unknown>): string {
  // Best-effort single-line summary
  const entries = Object.entries(args)
  if (entries.length === 0) return ''
  if (entries.length === 1) {
    const [first] = entries
    if (first) {
      const [k, v] = first
      if (typeof v === 'string') return v.length < 80 ? v : k + '=' + v.slice(0, 60) + '…'
      return `${k}=${JSON.stringify(v)}`
    }
  }
  return entries.map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' ')
}

/**
 * Group a raw message list into domain `Message[]` by collapsing tool-role
 * follow-ups into the preceding assistant message's `tools[]`.
 */
export function wireMessagesToDomain(wire: WireMessage[]): Message[] {
  const out: Message[] = []
  const pendingByCallId = new Map<string, ToolCall>()

  for (const w of wire) {
    if (w.role === 'tool' && w.tool_call_id) {
      // Fold into the last assistant message's tools[], closing out duration
      // if we ever wire up timing metadata.
      const last = out[out.length - 1]
      if (last?.tools) {
        const target = last.tools.find(
          (t) => pendingByCallId.get(w.tool_call_id ?? '') === t,
        )
        if (target) {
          target.dur ??= 0
        }
      }
      continue
    }

    const text = w.content ?? ''
    const msg: Message = {
      id: w.id,
      role: w.role,
      text,
      timestamp: w.timestamp,
    }

    if (w.reasoning) {
      msg.reasoning = w.reasoning
    }

    if (w.tool_calls && w.tool_calls.length > 0) {
      const tools = w.tool_calls.map((tc) => wireToolCallToDomain(tc))
      msg.tools = tools
      w.tool_calls.forEach((tc, i) => {
        const domain = tools[i]
        if (domain) pendingByCallId.set(tc.id, domain)
      })
    }

    out.push(msg)
  }
  return out
}

export interface SessionConversionContext {
  /** Max context window for the session's model, in tokens. */
  modelContextWindow: number
  /** Whether this session has an active run right now. */
  live: boolean
  /** UI-only pinned/archived state from localStorage. */
  pinned: boolean
  archived: boolean
  /** Skill ids attached to this session (client-side memory). */
  skills: string[]
  /** Personality used at session start (client-side memory). */
  personality: string
}

export function wireSessionToDomain(
  wire: WireSession,
  messages: Message[],
  ctx: SessionConversionContext,
): Session {
  const tokens = wire.input_tokens + wire.output_tokens
  const cost = wire.estimated_cost_usd ?? wire.actual_cost_usd ?? 0
  const lastUpdate = messages[messages.length - 1]?.timestamp ?? wire.started_at
  const contextPct =
    ctx.modelContextWindow > 0
      ? Math.min(100, Math.round((tokens / ctx.modelContextWindow) * 100))
      : 0

  return {
    id: wire.id,
    title: wire.title ?? firstUserMessage(messages) ?? 'untitled',
    model: wire.model ?? 'unknown',
    personality: ctx.personality,
    skills: ctx.skills,
    pinned: ctx.pinned,
    archived: ctx.archived,
    live: ctx.live,
    tokens,
    cost,
    contextPct,
    msgCount: wire.message_count,
    updated: Math.round(lastUpdate * 1000),
    messages,
  }
}

function firstUserMessage(messages: Message[]): string | null {
  for (const m of messages) {
    if (m.role === 'user' && m.text) {
      return m.text.length > 48 ? m.text.slice(0, 48) + '…' : m.text
    }
  }
  return null
}

export function wireSkillToDomain(wire: WireSkill): Skill {
  return {
    id: wire.id,
    name: wire.name,
    desc: wire.description,
    installed: wire.installed,
    pinned: wire.tapped,
    version: wire.version,
    author: wire.author,
    category: wire.category,
  }
}
