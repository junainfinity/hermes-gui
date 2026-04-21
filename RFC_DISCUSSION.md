# RFC: Management endpoints for the API server + companion Web UI

> **Intended audience:** Nous Research maintainers
> **Target repo:** [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
> **Author:** @arjun
> **Status:** Draft — ready to post as a GitHub Discussion under *Ideas* or *Show and tell*.

## TL;DR

I'd like to contribute:

1. A small set of read-focused **management endpoints** to the existing
   `gateway.platforms.api_server` — `/v1/sessions*`, `/v1/skills`,
   `/v1/config`, `/v1/profile` — so that any client can build a proper GUI
   on top of Hermes without shelling out to the CLI or parsing SQLite
   directly. Single file, ~380 LOC, 27 pytest tests, no behaviour changes
   to existing routes.
2. A companion **web UI** (separate repo, MIT, TypeScript + React + Vite)
   that consumes these endpoints to deliver a daily-driver chat experience
   (sessions, skills hub, background tasks, settings) alongside the
   terminal UI.

Both are ready to submit. Looking for guidance on whether:
- the endpoint shape/naming fits your intended trajectory for the API
  server;
- you'd prefer the UI to live in-tree as a sibling to `website/` or stay
  as a separate repo;
- there are CI/release conventions I should match before opening the PR.

## Why this might be worth your time

The existing API server is already OpenAI-compatible and exposes the agent
itself (`/v1/chat/completions`, `/v1/responses`, `/v1/runs`). This covers
**driving the agent**, but not **everything around it** — session history,
skill state, config. Today a client has to:

- Open `~/.hermes/state.db` directly (the schema is stable at v6, but
  reaching into someone else's SQLite from a web UI is a code smell);
- Shell out to `hermes sessions`, `hermes skills`, `hermes config` and
  parse their output (brittle across versions);
- Or re-implement CLI logic to discover skills from the filesystem, etc.

Extending `api_server.py` keeps these concerns inside the existing auth
gate (`_check_auth` / `API_SERVER_KEY`), CORS story
(`API_SERVER_CORS_ORIGINS`), and bind guards (loopback-only by default,
refuse network bind without a real key). A browser app with a bearer
token can then implement every page of a real GUI without seeing any
Hermes internals.

I've pushed both halves of the change to a local branch and they're
working end-to-end. Happy to open a PR the moment there's any signal
from maintainers.

## Proposed endpoints (Phase 1)

All routes under `/v1/`, all behind `_check_auth`, no new env vars.

| Method | Path                                      | Summary                           |
| ------ | ----------------------------------------- | --------------------------------- |
| GET    | `/v1/sessions?source=&limit=&offset=&q=`  | List sessions with preview        |
| GET    | `/v1/sessions/{id}/messages?after_id=&limit=` | Paginated message history     |
| PATCH  | `/v1/sessions/{id}`                       | Rename (body: `{title}`)          |
| DELETE | `/v1/sessions/{id}`                       | Remove                            |
| GET    | `/v1/sessions/{id}/export?format=markdown\|json` | Download conversation      |
| GET    | `/v1/skills`                              | Enumerate installed skills        |
| GET    | `/v1/config`                              | Parsed `config.yaml` (secrets in `.env` untouched) |
| GET    | `/v1/profile`                             | Active profile, providers, model  |

Each payload is JSON with fields matching the SQLite schema one-to-one
where applicable. `tool_calls` on messages is pre-parsed from its JSON
string column into a structured list. The markdown export is a
conventional transcript (H1 title, `## role` sections).

### Not in this PR (explicit)

- `PATCH /v1/config` — tedious to validate safely; better in a focused
  follow-up.
- Skill install/uninstall — want to settle on whether these dispatch to
  the existing `hermes_cli.skills` code in-process or shell out to
  `hermes skills` for identical behaviour.
- Any new env vars, auth mechanisms, or CORS defaults.

## Implementation sketch

```
gateway/platforms/
  api_server.py              # existing — 1 added import + 6 added lines in connect()
  api_server_mgmt.py         # new — handlers + register_management_routes()
tests/gateway/
  test_api_server_mgmt.py    # new — 27 tests, all passing on Python 3.11
```

The adapter's `connect()` gets one new block at the existing route
registration site:

```python
try:
    from gateway.platforms.api_server_mgmt import register_management_routes
    register_management_routes(self._app, self)
except ImportError:
    logger.debug("[%s] management endpoints unavailable", self.name)
```

Handlers reuse `self._check_auth`, `_openai_error`-style responses, and
the existing `SessionDB` / `get_hermes_home` helpers. Nothing hot-path.

## Companion web UI

Separate MIT-licensed repo (working name `hermes-webui`), talks to
`http://127.0.0.1:8642/v1` with a user-supplied bearer token stored in
`localStorage`. Stack: React 18 + TypeScript strict + Vite + Vitest +
ESLint + GitHub Actions CI — 29 unit tests, zero lint/typecheck
warnings, 223KB JS (67KB gzipped) production bundle.

Feature parity with the terminal UI's daily-driver surface: home
dashboard, multi-tab chat with tool-stream rail, sessions browser,
skills hub, background tasks, full settings. SSE consumption of
`/v1/runs/{id}/events` is already wired and type-safe.

Roadmap:

- v0.1 against the Phase-1 endpoints (read-only)
- v0.2 once write-path endpoints land (Phase 2 PR)
- Electron wrap for signed Mac/Windows installers once the web
  experience is stable

## What I'd like from maintainers

1. **Shape feedback.** Are the paths and payloads roughly what you'd
   accept? Anything you'd prefer under `/api/` instead of `/v1/` (I see
   `/api/jobs` already lives under `/api/`)?
2. **Location.** Keep `api_server_mgmt.py` as a separate module next to
   the main adapter (minimal diff), or fold into `api_server.py`?
3. **UI home.** OK for the frontend to live in a separate `hermes-webui`
   repo, or prefer an in-tree `website/webui/`? I'm happy to hand over
   stewardship either way.
4. **Release cadence.** Anything I should know about your tagging,
   changelog, or PR workflow that isn't already in `CONTRIBUTING.md`?

## Anticipated questions

**"Why not just use `hermes dashboard`?"** — It's an observability UI
(metrics, gateway status). The proposed web UI is a daily-driver chat
client with skills, sessions, tool streaming etc. Different job, not a
replacement.

**"Why not ACP?"** — ACP is great for editor integration and I considered
it, but for a browser you'd need a stdio-to-WebSocket proxy plus a JSON-RPC
client. Extending the existing HTTP server is much smaller and more
aligned with how other OpenAI-compatible frontends (Open WebUI, LobeChat)
already plug in.

**"How are you handling CORS?"** — Reuses the existing
`API_SERVER_CORS_ORIGINS` mechanism. Defaults continue to require explicit
opt-in; the UI documents setting it to `http://127.0.0.1:5173` for dev.

**"Security?"** — Zero change to the auth model. All new routes go
through the existing `_check_auth` gate. `/v1/config` returns only what's
in `config.yaml` — secrets live in `.env` and aren't touched.

---

Full design doc, including data-model mappings, threat model, and test
plan, lives at [DESIGN.md](./DESIGN.md) in the UI repo. Happy to move any
of it into this discussion, upstream an RFC file, or just open the PR —
whichever fits your workflow best.

Thanks for Hermes. It's been genuinely fun to build against.
