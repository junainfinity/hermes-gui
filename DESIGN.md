# Hermes Web UI — Design Document

> **Status:** Draft v0.1
> **Author:** @arjun (proposed upstream contribution to [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent))
> **Last updated:** 2026-04-21

---

## 1. Motivation

Hermes Agent (v0.10.0) is a terminal-native AI agent with excellent depth but a
steep learning curve: the TUI demands keybindings, the gateway exposes only
messaging adapters (Telegram/Slack/etc.), and the `hermes dashboard` web UI is
tailored to observability rather than daily driving.

This project adds a first-class **browser and desktop UI** for Hermes — the same
experience a user would get from a modern agent product (chat, sessions, skills
hub, background tasks, settings), backed by the existing Hermes agent core and
contributed as a companion to `hermes-agent` itself.

## 2. Goals & non-goals

### Goals

- **Daily-driver UX.** Full feature parity with the terminal CLI for the things
  users actually do: starting sessions, resuming sessions, pinning skills,
  queueing background work, adjusting model/personality/reasoning.
- **Zero runtime coupling.** The frontend is a pure static bundle that speaks
  HTTP to Hermes. No Node sidecar, no shelling out from the browser.
- **Upstream-friendly.** Missing management endpoints are added to
  `gateway/platforms/api_server.py` so they live inside Hermes' existing
  auth/CORS/security boundary. Two coordinated PRs:
  1. `NousResearch/hermes-agent` — new `/v1/sessions`, `/v1/skills`, `/v1/config`,
     `/v1/profile` endpoints under the existing API server adapter.
  2. `hermes-webui` (this repo) — the Vite + React + TypeScript frontend.
- **Desktop story.** The same bundle is wrapped in Electron for signed
  Mac/Windows installers once the web experience stabilizes.
- **Polish.** Matches Hermes' engineering conventions (ruff + mypy, pytest,
  aiohttp patterns); matches modern frontend conventions (TS strict, ESLint,
  Prettier, Vitest, GitHub Actions).

### Non-goals (v1)

- Multi-user / multi-tenant. Hermes is single-user by design; the UI is too.
- Mobile-first layouts. Desktop-class screens only in v1.
- Replacing `hermes dashboard`. The observability dashboard and daily-driver UI
  serve different users; they coexist.
- Reimplementing the CLI's messaging-platform adapters. The gateway keeps its
  existing adapters (Telegram, Slack, etc.); the web UI is one more frontend on
  top of the same agent core.

## 3. Architecture

```
┌────────────────────────────────────────────────────────────────┐
│ Browser (hermes-webui — this repo)                             │
│  React 18 + TypeScript + Vite                                  │
│  ├─ state: Context + reducer (typed)                           │
│  ├─ transport: hermes-client.ts (fetch + EventSource)          │
│  └─ persistence: localStorage (UI-only state)                  │
└───────────────────────┬────────────────────────────────────────┘
                        │ HTTP + SSE
                        │ Authorization: Bearer $API_SERVER_KEY
                        ▼
┌────────────────────────────────────────────────────────────────┐
│ Hermes Gateway (API_SERVER platform, 127.0.0.1:8642)           │
│  aiohttp                                                        │
│  ├─ EXISTING: /v1/chat/completions, /v1/responses, /v1/runs    │
│  │            /v1/models, /health                              │
│  └─ NEW (this RFC):                                             │
│      /v1/sessions             list / get / delete / rename     │
│      /v1/sessions/{id}/messages    read full history           │
│      /v1/sessions/{id}/export      markdown export             │
│      /v1/skills               list / install / uninstall       │
│      /v1/skills/{id}          inspect                          │
│      /v1/config               get / patch                      │
│      /v1/profile              current user identity            │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│ Hermes Agent Core                                               │
│  run_agent.AIAgent  +  hermes_state.SessionDB                   │
│  ~/.hermes/state.db (SQLite, WAL, schema v6)                    │
│  ~/.hermes/config.yaml                                          │
│  ~/.hermes/skills/*/SKILL.md                                    │
└────────────────────────────────────────────────────────────────┘
```

Nothing new in blue. Only the gray "NEW" block is the proposed upstream change.
Everything else already exists in Hermes v0.10.0.

## 4. Existing surface we consume (unchanged)

From [`gateway/platforms/api_server.py`](../../../.hermes/hermes-agent/gateway/platforms/api_server.py):

### `POST /v1/runs`

```http
POST /v1/runs
Authorization: Bearer $API_SERVER_KEY
Content-Type: application/json

{
  "input": "Summarize PR #412",        // or [{"role":"user","content":"..."}]
  "session_id": "sess_abc",            // optional; defaults to run_id
  "instructions": "…system prompt…",   // optional
  "previous_response_id": "resp_…",    // optional (stateful resume)
  "conversation_history": [            // optional (explicit override)
    {"role":"user","content":"…"},
    {"role":"assistant","content":"…"}
  ]
}
```

Responds `202 {"run_id":"run_…","status":"started"}`.

### `GET /v1/runs/{run_id}/events` (SSE)

```
data: {"event":"message.delta","run_id":"run_…","timestamp":…,"delta":"Hel"}
data: {"event":"message.delta","run_id":"run_…","timestamp":…,"delta":"lo"}
data: {"event":"tool.started","run_id":"…","timestamp":…,"tool":"terminal","preview":"git status"}
data: {"event":"tool.completed","run_id":"…","timestamp":…,"tool":"terminal","duration":0.31,"error":false}
data: {"event":"reasoning.available","run_id":"…","timestamp":…,"text":"First I'll check…"}
data: {"event":"run.completed","run_id":"…","timestamp":…,"output":"…","usage":{"input_tokens":…,"output_tokens":…,"total_tokens":…}}
```

On failure: `{"event":"run.failed","error":"…"}`. SSE comments (`: keepalive`)
every 30s. Stream closes with `: stream closed` and EOF after terminal event.

### `POST /v1/chat/completions`

OpenAI-compatible, with opt-in `X-Hermes-Session-Id` header for continuity.
Used for the compatibility layer; not the primary transport.

### `GET /v1/models`

OpenAI-compatible model listing.

## 5. Proposed new endpoints

These extend `api_server.py` with read/write management of Hermes-owned state
that currently is only reachable via CLI subcommands. Everything below is
behind the existing `Authorization: Bearer $API_SERVER_KEY` auth.

### 5.1 Sessions

```http
GET /v1/sessions?source=cli&limit=50&offset=0&q=docker
```

Returns:

```json
{
  "sessions": [
    {
      "id": "sess_abc",
      "title": "refactoring auth middleware",
      "source": "cli",
      "model": "anthropic/claude-sonnet-4.6",
      "started_at": 1713456789.123,
      "ended_at": null,
      "message_count": 28,
      "tool_call_count": 7,
      "input_tokens": 8400,
      "output_tokens": 4000,
      "estimated_cost_usd": 0.06,
      "parent_session_id": null
    }
  ],
  "total": 137
}
```

Source: `SessionDB.list_sessions(source=..., limit=..., offset=...)`, existing.
`q` parameter uses `SessionDB.search_messages()` and returns distinct
`session_id`s.

```http
GET /v1/sessions/{id}
```

Returns single session + last message preview. 404 if absent.

```http
GET /v1/sessions/{id}/messages?after_id=123&limit=200
```

Returns paginated message list. Shape matches `SessionDB.get_messages()` with
the `tool_calls` JSON already parsed:

```json
{
  "messages": [
    {
      "id": 8801,
      "role": "user",
      "content": "Can you walk through the PKCE flow?",
      "timestamp": 1713456789.5
    },
    {
      "id": 8802,
      "role": "assistant",
      "content": "Here's the current flow…",
      "timestamp": 1713456795.1,
      "token_count": 512,
      "finish_reason": "tool_calls",
      "reasoning": "First I'll read session.ts…",
      "tool_calls": [
        {"id": "call_1", "function": {"name": "file_edit", "arguments": "{…}"}}
      ]
    },
    {
      "id": 8803,
      "role": "tool",
      "tool_call_id": "call_1",
      "tool_name": "file_edit",
      "content": "…result…",
      "timestamp": 1713456795.7
    }
  ],
  "has_more": false
}
```

```http
PATCH /v1/sessions/{id}
{
  "title": "New title"
}

DELETE /v1/sessions/{id}

GET /v1/sessions/{id}/export?format=markdown
```

### 5.2 Skills

```http
GET /v1/skills
```

Returns both installed and available. Installed are enumerated from
`~/.hermes/skills/*/SKILL.md`; hub catalog via `hermes skills search --json`
(cached 5 min).

```json
{
  "skills": [
    {
      "id": "github-pr-workflow",
      "name": "github-pr-workflow",
      "version": "2.4.0",
      "author": "hermes",
      "category": "dev",
      "description": "Open, review, merge PRs end-to-end.",
      "installed": true,
      "path": "/Users/arjun/.hermes/skills/github-pr-workflow",
      "tapped": false
    }
  ]
}
```

`tapped` is Hermes' existing concept (from `hermes skills tap`) — the UI maps
it to "pinned" for end-user clarity.

```http
POST   /v1/skills/{id}/install
DELETE /v1/skills/{id}
POST   /v1/skills/{id}/tap      // subscribe
DELETE /v1/skills/{id}/tap      // unsubscribe
GET    /v1/skills/{id}          // full SKILL.md + frontmatter
```

All of these shell-exec the existing `hermes skills …` subcommands to avoid
duplicating logic. Return payloads mirror the command's JSON output.

### 5.3 Config

```http
GET /v1/config
```

Returns the parsed `~/.hermes/config.yaml` (with secrets redacted — anything
matching `${VAR}` is left as-is; the gateway never returns `.env` values).

```http
PATCH /v1/config
{
  "agent.model": "anthropic/claude-sonnet-4.6",
  "compression.threshold": 0.6,
  "personalities.default": "concise"
}
```

Uses dotted-path keys. Writes via Hermes' existing `config.set()` helper in
`hermes_cli/config.py`. Validates the key exists in the published schema before
writing. Returns the new full config.

### 5.4 Profile

```http
GET /v1/profile
```

```json
{
  "profile": "default",
  "display_name": "arjun",
  "email": "arjun@example.com",
  "providers_configured": ["openrouter", "anthropic"],
  "active_provider": "openrouter",
  "active_model": "anthropic/claude-sonnet-4.6"
}
```

Reads from `hermes_cli.profile` + `hermes config show`.

## 6. UI data model ↔ Hermes schema mapping

The provided UI stores data in shapes that don't all map 1:1 to Hermes. This
table is the authoritative mapping. **Client-only** fields are kept in
`localStorage`; everything else round-trips through the endpoints above.

| UI field (`store.tsx`)              | Source                                           | Direction |
| ----------------------------------- | ------------------------------------------------ | --------- |
| `session.id / title / model`        | `sessions.id / title / model`                    | R/W       |
| `session.updated`                   | `max(messages.timestamp)` or `sessions.started_at` | R       |
| `session.tokens`                    | `sessions.input_tokens + output_tokens`          | R         |
| `session.cost`                      | `sessions.estimated_cost_usd`                    | R         |
| `session.contextPct`                | computed client-side: `tokens / model_ctx`       | computed  |
| `session.msgCount`                  | `sessions.message_count`                         | R         |
| `session.messages[]`                | `/v1/sessions/{id}/messages`                     | R         |
| `session.messages[].tools[]`        | parse `messages.tool_calls` + tool-role siblings | R         |
| `session.live`                      | client-side: is `/v1/runs/{id}` active           | client    |
| `session.pinned / archived`         | **localStorage**                                 | client    |
| `session.skills[]`                  | client-side snapshot at session start            | client    |
| `skills[]`                          | `/v1/skills`                                     | R/W       |
| `skill.pinned`                      | maps to `skill.tapped`                           | R/W       |
| `bgTasks[]`                         | client-side: tracked `run_id`s with separate SSE | client    |
| `bgTasks[].progress%`               | **dropped** — Hermes doesn't emit progress       | removed   |
| `bgTasks[].status`                  | derived: `running` until `run.completed`         | client    |
| `settings.model / provider`         | `/v1/config` → `agent.model / providers.active` | R/W       |
| `settings.personality`              | `/v1/config` → `personalities.default`           | R/W       |
| `settings.reasoning`                | per-run `reasoning_effort` in `/v1/runs` body    | W         |
| `settings.compressionThreshold`     | `/v1/config` → `compression.threshold`           | R/W       |
| `settings.compressionModel`         | `/v1/config` → `auxiliary.compression.model`     | R/W       |
| `settings.temperature`              | per-run param; not in Hermes config              | client    |
| `settings.dailyBudget`              | client-side soft cap; warns but doesn't enforce  | client    |
| `settings.connectors.*`             | `/v1/config` → `platform_toolsets.api_server`    | R/W       |
| `settings.dark / density`           | **localStorage**                                 | client    |
| `models[]`                          | `/v1/models`                                     | R         |
| `personalities[]`                   | `/v1/config` → `personalities.*`                 | R         |
| `slashCommands[]`                   | hardcoded + `/v1/skills` (installed → commands)  | R         |
| `voiceOn`                           | Web Speech API, client-side                      | client    |
| `openTabs / activeSessionId`        | **localStorage**                                 | client    |

## 7. Auth

### Current state
The API server adapter already reads `API_SERVER_KEY` from env and enforces
`Authorization: Bearer $KEY` on all `/v1/*` routes via `_check_auth()`. Our new
endpoints reuse the same gate.

### First-run key generation
On first boot of Hermes with the web UI enabled, generate a 256-bit random key,
write it to `~/.hermes/api_server.key` with mode `0600`, and print it once to
stdout. The web UI reads it from localStorage (set by the user during
onboarding) and sends it as a Bearer token on every request.

### CORS
The adapter already supports `API_SERVER_CORS_ORIGINS`. Default for the web UI
deployment: `http://127.0.0.1:5173` (Vite dev) and `http://127.0.0.1:4173`
(Vite preview). Production desktop bundle: `file://` + `app://hermes`.

### Key rotation
`POST /v1/profile/rotate-key` generates a new key, returns it once, invalidates
the old one. UI prompts the user to save it to localStorage.

### Not in scope (v1)
- OAuth / SSO
- Per-client scopes
- TLS termination (document that the user should run behind a reverse proxy
  if exposing beyond localhost)

## 8. Threat model

| Threat                                         | Mitigation                                |
| ---------------------------------------------- | ----------------------------------------- |
| Malicious site exfiltrates `API_SERVER_KEY`    | CORS allowlist; default bind to loopback  |
| Another user on the machine reads `state.db`   | Out of scope — OS file permissions        |
| CSRF via a user's browser                      | Bearer token is not a cookie; not sent cross-site |
| Prompt injection via rendered messages         | All assistant output rendered as text (no HTML); tool output truncated |
| Skill install from untrusted author            | Reuses Hermes' existing skill audit flow (`hermes skills audit`) |
| DoS via many runs                              | `_MAX_CONCURRENT_RUNS` already enforced by api_server |
| Replay of captured bearer token                | Short-lived sessions; key rotation endpoint |

## 9. Frontend architecture

### Stack
- **Vite 6** (build) + **React 18** + **TypeScript 5** (strict)
- **ESLint 9** (flat config) + **Prettier 3** (no semi, single-quote)
- **Vitest** (unit) + **Playwright** (e2e, post-v1)
- **No UI library** — the provided design uses bespoke CSS vars; we preserve it
- **No router library** — the existing `route` field in state is enough for a
  tab-style SPA; swap for `react-router` if/when URLs matter

### State management
`Context + useReducer`, typed. Pure functions for each action; side effects
(fetch, SSE) invoked from `useEffect` hooks that dispatch on completion. One
reducer, many async thunks.

### Streaming
`hermes-client.ts` exposes:

```ts
export interface HermesClient {
  listSessions(opts?: ListSessionsOptions): Promise<SessionListResponse>
  getSession(id: string): Promise<Session>
  getMessages(id: string, opts?: PaginationOptions): Promise<MessageListResponse>
  createRun(opts: CreateRunOptions): Promise<{ run_id: string }>
  streamRun(run_id: string, handlers: RunEventHandlers): AbortController
  listSkills(): Promise<Skill[]>
  installSkill(id: string): Promise<Skill>
  uninstallSkill(id: string): Promise<void>
  getConfig(): Promise<HermesConfig>
  patchConfig(patch: ConfigPatch): Promise<HermesConfig>
  getProfile(): Promise<Profile>
}
```

SSE is consumed via the native `EventSource` API. Discriminated union over the
`event` field gives type-safe handlers.

### Routing
In-memory `{ name, params }` state today; migrate to URL-backed routing when we
add bookmarkable session URLs.

### Persistence
localStorage under `hermes-webui-v1`. Migrations versioned.

### Accessibility
- Keyboard-first — `⌘K` palette, arrow navigation, focus rings preserved
- All icons have `aria-label`
- Color contrast AA on both themes

## 10. Testing strategy

### Frontend
- **Unit** (Vitest): reducer, `hermes-client.ts` with mocked fetch/SSE,
  message-tool-pairing logic, markdown renderer
- **Component** (Vitest + Testing Library): home page composer, chat composer
  slash-command popup, skill install flow
- **E2E** (Playwright, post-v1): golden-path chat, resume, background task

### Backend (Hermes PR)
- Pytest modules under `tests/gateway/platforms/test_api_server_sessions.py`
  etc., matching Hermes' existing test layout
- Every new route: 200 happy path, 401 without auth, 404 for missing IDs,
  schema-roundtrip test that PATCH + GET returns the same shape

### CI
- GitHub Actions: `lint` + `typecheck` + `test` + `build` on every PR, Node 22
  matrix. Artifact upload of the `dist/` bundle.

## 11. Release & packaging

- **Phase 1**: merge backend PR into Hermes upstream (or publish companion pip
  package `hermes-api-extensions` if not merged)
- **Phase 2**: tag frontend v0.1.0, publish GitHub release with screenshots
- **Phase 3**: Electron wrap for Mac (universal) and Windows, distributed via
  GitHub Releases. Code signing via Apple Developer + Windows EV cert.

## 12. Open questions (RFC)

1. **Skills registry URL.** Where does `hermes skills search` actually pull
   from? The docs mention a hub but I haven't traced the URL. If it's a
   first-party server, confirm the UI can query it directly (avoids proxying).
2. **`session.pinned / archived`.** Should these be added to the `sessions`
   table upstream, or is localStorage sufficient? Leaning localStorage for v1,
   but open to a migration if Nous prefers.
3. **Progress events.** Would Nous accept a PR that adds optional
   `progress.update` SSE events to long-running tools (e.g. `terminal` with
   stdout chunks)? Would close the UI gap.
4. **OpenAPI spec.** Should we maintain an OpenAPI 3.1 spec alongside the code,
   and optionally generate the TS client from it?
5. **i18n.** All strings are English in v1. Defer structure discussion.

## 13. Milestones

- **M0 (this doc):** design reviewed, open questions resolved with Nous
- **M1:** frontend scaffold + `hermes-client.ts` with mocked backend
- **M2:** upstream PR #1 — read-only endpoints (`GET /v1/sessions*`, `GET /v1/skills`, `GET /v1/config`, `GET /v1/profile`)
- **M3:** frontend wired to M2 endpoints; chat + session browse end-to-end
- **M4:** upstream PR #2 — write endpoints (`PATCH /v1/config`, skills install/uninstall, session delete/rename)
- **M5:** full UI feature parity; v0.1.0 release candidate
- **M6:** Electron wrap + signed installers
