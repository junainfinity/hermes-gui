/**
 * Types for Hermes Web UI.
 *
 * Two namespaces:
 *   - `Wire.*`  — what crosses the network (matches Hermes' API server responses)
 *   - `Store.*` — what lives in the React reducer (adds UI-only state)
 *
 * Conversions happen in `src/client/hermes-client.ts` (wire → domain) and
 * `src/store/reducer.ts` (domain → store shape).
 */

// ─── Wire types (what Hermes' API server returns) ────────────────────────────

/** Row from the `sessions` SQLite table, as returned by `GET /v1/sessions`. */
export interface WireSession {
  id: string
  source: string
  user_id: string | null
  model: string | null
  model_config: string | null
  system_prompt: string | null
  parent_session_id: string | null
  started_at: number
  ended_at: number | null
  end_reason: string | null
  message_count: number
  tool_call_count: number
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_write_tokens: number
  reasoning_tokens: number
  billing_provider: string | null
  billing_base_url: string | null
  billing_mode: string | null
  estimated_cost_usd: number | null
  actual_cost_usd: number | null
  cost_status: string | null
  cost_source: string | null
  pricing_version: string | null
  title: string | null
}

export interface WireSessionListResponse {
  sessions: WireSession[]
  total: number
}

/** Row from the `messages` SQLite table. `tool_calls` is JSON-parsed. */
export interface WireMessage {
  id: number
  session_id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  tool_call_id: string | null
  tool_calls: WireToolCall[] | null
  tool_name: string | null
  timestamp: number
  token_count: number | null
  finish_reason: string | null
  reasoning: string | null
  reasoning_details: unknown
}

export interface WireToolCall {
  id: string
  type?: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface WireMessageListResponse {
  messages: WireMessage[]
  has_more: boolean
}

/** Skill manifest, derived from `SKILL.md` frontmatter + filesystem state. */
export interface WireSkill {
  id: string
  name: string
  version: string
  author: string
  category: string
  description: string
  installed: boolean
  path: string | null
  tapped: boolean
}

export interface WireSkillListResponse {
  skills: WireSkill[]
}

export interface WireConfig {
  agent: Record<string, unknown>
  compression: {
    enabled: boolean
    threshold: number
  }
  auxiliary: {
    compression?: { model?: string }
  }
  personalities: Record<string, string>
  platform_toolsets: Record<string, string[]>
  providers?: { active?: string }
  [key: string]: unknown
}

export interface WireProfile {
  profile: string
  display_name: string
  email: string | null
  providers_configured: string[]
  active_provider: string | null
  active_model: string | null
}

export interface WireModelInfo {
  id: string
  object: 'model'
  owned_by: string
  context_length?: number
  pricing?: { input: number; output: number }
}

export interface WireModelListResponse {
  object: 'list'
  data: WireModelInfo[]
}

// ─── SSE event types (from `GET /v1/runs/{id}/events`) ───────────────────────

interface SSEEventBase {
  run_id: string
  timestamp: number
}

export interface SSEMessageDelta extends SSEEventBase {
  event: 'message.delta'
  delta: string
}

export interface SSEToolStarted extends SSEEventBase {
  event: 'tool.started'
  tool: string
  preview: string | null
}

export interface SSEToolCompleted extends SSEEventBase {
  event: 'tool.completed'
  tool: string
  duration: number
  error: boolean
}

export interface SSEReasoningAvailable extends SSEEventBase {
  event: 'reasoning.available'
  text: string
}

export interface SSERunCompleted extends SSEEventBase {
  event: 'run.completed'
  output: string
  usage: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

export interface SSERunFailed extends SSEEventBase {
  event: 'run.failed'
  error: string
}

export type RunEvent =
  | SSEMessageDelta
  | SSEToolStarted
  | SSEToolCompleted
  | SSEReasoningAvailable
  | SSERunCompleted
  | SSERunFailed

// ─── Run request shape (POST /v1/runs) ───────────────────────────────────────

export interface CreateRunRequest {
  input: string | { role: string; content: string }[]
  session_id?: string
  instructions?: string
  previous_response_id?: string
  conversation_history?: { role: string; content: string }[]
  /** Hermes-specific: pass-through to agent `reasoning_effort`. */
  reasoning_effort?: 'low' | 'medium' | 'high'
}

export interface CreateRunResponse {
  run_id: string
  status: 'started'
}

// ─── Client errors ───────────────────────────────────────────────────────────

export class HermesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'HermesApiError'
  }
}

// ─── Domain types (UI-facing) ────────────────────────────────────────────────
//
// The UI operates on these, not wire shapes. Converters in hermes-client.ts
// map between them.

export type ToolKind = 'terminal' | 'web' | 'file' | 'github' | 'search' | 'other'

export interface ToolCall {
  tool: ToolKind
  call: string
  /** Duration in seconds once complete; undefined while running. */
  dur?: number
  /** True if this call produced a diff that should render inline. */
  diff?: boolean
  /** True if completion produced an error. */
  error?: boolean
}

export interface Message {
  id?: number
  role: 'user' | 'assistant' | 'system' | 'tool'
  text: string
  tools?: ToolCall[]
  /** Present on assistant messages with diff-producing tools. */
  diff?: boolean
  /** Reasoning trace text (Anthropic-style thinking). */
  reasoning?: string
  timestamp?: number
}

export interface Session {
  id: string
  title: string
  model: string
  personality: string
  skills: string[]
  pinned: boolean
  archived: boolean
  live: boolean
  warn?: boolean
  tokens: number
  cost: number
  contextPct: number
  msgCount: number
  updated: number
  messages: Message[]
}

export interface Skill {
  id: string
  name: string
  desc: string
  installed: boolean
  pinned: boolean
  version: string
  author: string
  category: string
}

export interface BgTask {
  id: string
  /** Hermes run_id for server correlation. */
  runId?: string
  title: string
  elapsed: number
  status: 'running' | 'done' | 'cancelled' | 'failed'
  model: string
  output?: string
  error?: string
}

export interface Model {
  id: string
  label: string
  provider: string
  /** Human string like "200K". */
  ctx: string
  /** Context length in tokens, for contextPct math. */
  ctxTokens: number
  /** Human string like "$3/$15". */
  cost: string
}

export interface Personality {
  id: string
  label: string
  desc: string
}

export interface SlashCommand {
  cmd: string
  desc: string
}

export interface Connectors {
  terminal: boolean
  web: boolean
  files: boolean
  github: boolean
  slack: boolean
  gmail: boolean
}

export type Density = 'compact' | 'cozy' | 'comfortable'
export type Reasoning = 'low' | 'medium' | 'high'
export type RightPanel = 'tools' | 'inspector' | 'hidden'
export type RouteName = 'home' | 'chat' | 'sessions' | 'skills' | 'background' | 'settings'

export interface Route {
  name: RouteName
  params?: Record<string, string>
}

export interface Settings {
  model: string
  personality: string
  reasoning: Reasoning
  fallback: string
  provider: string
  compressionThreshold: number
  compressionModel: string
  temperature: number
  dailyBudget: number
  dark: boolean
  density: Density
  connectors: Connectors
}

export interface Toast {
  msg: string
  id: number
}

export interface StoreState {
  route: Route
  activeSessionId: string | null
  openTabs: string[]
  sessions: Session[]
  skills: Skill[]
  bgTasks: BgTask[]
  models: Model[]
  personalities: Personality[]
  slashCommands: SlashCommand[]
  settings: Settings
  commandOpen: boolean
  voiceOn: boolean
  rightPanel: RightPanel
  leftPanelCollapsed: boolean
  toast: Toast | null
  /** True while we're doing the first-load fetches. */
  bootLoading: boolean
  /** Populated if the initial connection failed; the UI shows an onboarding card. */
  bootError: string | null
}
