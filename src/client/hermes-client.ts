/**
 * Typed HTTP + SSE client for Hermes' API server.
 *
 * Backend contract: `DESIGN.md` §4 (existing) and §5 (proposed).
 * All write endpoints require `Authorization: Bearer <apiKey>`.
 */

import type {
  AuthState,
} from './auth'
import { readSSE } from './sse'
import {
  wireMessagesToDomain,
  wireSessionToDomain,
  wireSkillToDomain,
  type SessionConversionContext,
} from './converters'
import {
  HermesApiError,
  type CreateRunRequest,
  type CreateRunResponse,
  type Message,
  type Model,
  type RunEvent,
  type Session,
  type Skill,
  type WireConfig,
  type WireMessageListResponse,
  type WireModelListResponse,
  type WireProfile,
  type WireSessionListResponse,
  type WireSkillListResponse,
} from '@/types'

export interface ListSessionsOptions {
  source?: string
  limit?: number
  offset?: number
  q?: string
}

export interface PaginationOptions {
  afterId?: number
  limit?: number
}

export interface RunEventHandlers {
  onDelta?: (delta: string) => void
  onToolStart?: (tool: string, preview: string | null) => void
  onToolComplete?: (tool: string, duration: number, error: boolean) => void
  onReasoning?: (text: string) => void
  onComplete?: (output: string, usage: { input_tokens: number; output_tokens: number; total_tokens: number }) => void
  onError?: (error: string) => void
}

export class HermesClient {
  constructor(private readonly auth: AuthState) {}

  // ── Health ───────────────────────────────────────────────────────────────

  async health(): Promise<void> {
    const res = await fetch(this.url('/health'), { headers: this.headers(false) })
    if (!res.ok) throw new HermesApiError(`Health check failed`, res.status)
  }

  // ── Models ───────────────────────────────────────────────────────────────

  async listModels(): Promise<Model[]> {
    const wire = await this.getJson<WireModelListResponse>('/v1/models')
    return wire.data.map((m) => ({
      id: m.id,
      label: m.id,
      provider: m.owned_by,
      ctx: m.context_length ? humanCtx(m.context_length) : '—',
      ctxTokens: m.context_length ?? 0,
      cost: m.pricing
        ? `$${m.pricing.input.toString()}/$${m.pricing.output.toString()}`
        : '—',
    }))
  }

  // ── Sessions ─────────────────────────────────────────────────────────────

  async listSessions(
    opts: ListSessionsOptions = {},
    ctxFor: (wireId: string) => SessionConversionContext,
  ): Promise<{ sessions: Session[]; total: number }> {
    const params = new URLSearchParams()
    if (opts.source !== undefined) params.set('source', opts.source)
    if (opts.limit !== undefined) params.set('limit', opts.limit.toString())
    if (opts.offset !== undefined) params.set('offset', opts.offset.toString())
    if (opts.q !== undefined && opts.q !== '') params.set('q', opts.q)
    const wire = await this.getJson<WireSessionListResponse>(
      `/v1/sessions${params.toString() ? '?' + params.toString() : ''}`,
    )
    const sessions = wire.sessions.map((w) =>
      wireSessionToDomain(w, [], ctxFor(w.id)),
    )
    return { sessions, total: wire.total }
  }

  async getSessionMessages(sessionId: string, opts: PaginationOptions = {}): Promise<{
    messages: Message[]
    hasMore: boolean
  }> {
    const params = new URLSearchParams()
    if (opts.afterId !== undefined) params.set('after_id', opts.afterId.toString())
    if (opts.limit !== undefined) params.set('limit', opts.limit.toString())
    const wire = await this.getJson<WireMessageListResponse>(
      `/v1/sessions/${encodeURIComponent(sessionId)}/messages` +
        (params.toString() ? '?' + params.toString() : ''),
    )
    return {
      messages: wireMessagesToDomain(wire.messages),
      hasMore: wire.has_more,
    }
  }

  async renameSession(sessionId: string, title: string): Promise<void> {
    await this.jsonRequest('PATCH', `/v1/sessions/${encodeURIComponent(sessionId)}`, { title })
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request('DELETE', `/v1/sessions/${encodeURIComponent(sessionId)}`)
  }

  async exportSession(sessionId: string): Promise<string> {
    const res = await fetch(
      this.url(`/v1/sessions/${encodeURIComponent(sessionId)}/export?format=markdown`),
      { headers: this.headers(true) },
    )
    if (!res.ok) throw await this.errorFromResponse(res)
    return res.text()
  }

  // ── Skills ───────────────────────────────────────────────────────────────

  async listSkills(): Promise<Skill[]> {
    const wire = await this.getJson<WireSkillListResponse>('/v1/skills')
    return wire.skills.map(wireSkillToDomain)
  }

  async installSkill(id: string): Promise<Skill> {
    const wire = await this.jsonRequest<{ skill: WireSkillListResponse['skills'][number] }>(
      'POST',
      `/v1/skills/${encodeURIComponent(id)}/install`,
    )
    return wireSkillToDomain(wire.skill)
  }

  async uninstallSkill(id: string): Promise<void> {
    await this.request('DELETE', `/v1/skills/${encodeURIComponent(id)}`)
  }

  async setSkillTapped(id: string, tapped: boolean): Promise<void> {
    await this.request(tapped ? 'POST' : 'DELETE', `/v1/skills/${encodeURIComponent(id)}/tap`)
  }

  // ── Config & profile ─────────────────────────────────────────────────────

  async getConfig(): Promise<WireConfig> {
    return this.getJson<WireConfig>('/v1/config')
  }

  async patchConfig(patch: Record<string, unknown>): Promise<WireConfig> {
    return this.jsonRequest<WireConfig>('PATCH', '/v1/config', patch)
  }

  async getProfile(): Promise<WireProfile> {
    return this.getJson<WireProfile>('/v1/profile')
  }

  // ── Runs ─────────────────────────────────────────────────────────────────

  async createRun(body: CreateRunRequest): Promise<CreateRunResponse> {
    return this.jsonRequest<CreateRunResponse>('POST', '/v1/runs', body)
  }

  /**
   * Subscribe to the SSE event stream for a run. Returns an AbortController;
   * call `.abort()` to stop consuming.
   */
  streamRun(runId: string, handlers: RunEventHandlers): AbortController {
    const ctrl = new AbortController()
    void this.consumeRunStream(runId, handlers, ctrl.signal)
    return ctrl
  }

  private async consumeRunStream(
    runId: string,
    handlers: RunEventHandlers,
    signal: AbortSignal,
  ): Promise<void> {
    const url = this.url(`/v1/runs/${encodeURIComponent(runId)}/events`)
    try {
      for await (const payload of readSSE({ url, headers: this.headers(true), signal })) {
        let parsed: RunEvent
        try {
          parsed = JSON.parse(payload) as RunEvent
        } catch {
          continue
        }
        dispatchRunEvent(parsed, handlers)
        if (parsed.event === 'run.completed' || parsed.event === 'run.failed') break
      }
    } catch (err) {
      if (signal.aborted) return
      if (err instanceof Error) handlers.onError?.(err.message)
      else handlers.onError?.('stream error')
    }
  }

  // ── Internal: HTTP helpers ───────────────────────────────────────────────

  private url(path: string): string {
    return this.auth.baseUrl.replace(/\/$/, '') + path
  }

  private headers(requireAuth: boolean, extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/json',
      ...extra,
    }
    if (this.auth.apiKey) h.Authorization = `Bearer ${this.auth.apiKey}`
    else if (requireAuth) throw new HermesApiError('Missing API key', 401)
    return h
  }

  private async getJson<T>(path: string): Promise<T> {
    const res = await fetch(this.url(path), { headers: this.headers(true) })
    if (!res.ok) throw await this.errorFromResponse(res)
    return res.json() as Promise<T>
  }

  private async jsonRequest<T>(
    method: 'POST' | 'PATCH' | 'PUT',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(this.url(path), {
      method,
      headers: this.headers(true, { 'Content-Type': 'application/json' }),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!res.ok) throw await this.errorFromResponse(res)
    // Some writes return 204 no content
    if (res.status === 204) return {} as T
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('application/json')) return {} as T
    return res.json() as Promise<T>
  }

  private async request(method: 'DELETE' | 'POST', path: string): Promise<void> {
    const res = await fetch(this.url(path), {
      method,
      headers: this.headers(true),
    })
    if (!res.ok) throw await this.errorFromResponse(res)
  }

  private async errorFromResponse(res: Response): Promise<HermesApiError> {
    let msg = `${res.status.toString()} ${res.statusText}`
    let code: string | undefined
    try {
      const body = (await res.json()) as { error?: { message?: string; code?: string } }
      if (body.error?.message) msg = body.error.message
      if (body.error?.code) code = body.error.code
    } catch {
      // non-JSON error body — keep the status text
    }
    return new HermesApiError(msg, res.status, code)
  }
}

function dispatchRunEvent(event: RunEvent, h: RunEventHandlers): void {
  switch (event.event) {
    case 'message.delta':
      h.onDelta?.(event.delta)
      break
    case 'tool.started':
      h.onToolStart?.(event.tool, event.preview)
      break
    case 'tool.completed':
      h.onToolComplete?.(event.tool, event.duration, event.error)
      break
    case 'reasoning.available':
      h.onReasoning?.(event.text)
      break
    case 'run.completed':
      h.onComplete?.(event.output, event.usage)
      break
    case 'run.failed':
      h.onError?.(event.error)
      break
  }
}

function humanCtx(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
  return tokens.toString()
}
