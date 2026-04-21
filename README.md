# Hermes Web UI

[![CI](https://github.com/arjun/hermes-webui/actions/workflows/ci.yml/badge.svg)](https://github.com/arjun/hermes-webui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A browser and desktop UI for [Hermes Agent](https://github.com/NousResearch/hermes-agent).

Chat, sessions, skills hub, background tasks, and full configuration — backed by
the agent core you already run in your terminal.

> **Status:** pre-alpha. See [DESIGN.md](./DESIGN.md) for the architecture and
> roadmap.

## Quick start

### Prerequisites

- Hermes Agent installed (`curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash`)
- Node.js 22+
- An inference provider configured (`hermes model`)

### Run locally

```sh
# 1. Enable Hermes' HTTP API server
export API_SERVER_ENABLED=true
export API_SERVER_KEY="$(openssl rand -hex 32)"
export API_SERVER_CORS_ORIGINS="http://127.0.0.1:5173"

# 2. Start Hermes as a daemon
hermes gateway run &

# 3. Start the web UI
npm install
npm run dev

# 4. Open http://127.0.0.1:5173, paste $API_SERVER_KEY in the onboarding dialog
```

## Architecture

```
┌──────────────────┐   HTTP + SSE    ┌──────────────────────┐
│  Hermes Web UI   │ ──────────────▶ │  Hermes API Server    │
│  (this repo)     │  Bearer auth    │  (gateway/api_server) │
└──────────────────┘                 └──────────┬───────────┘
                                                │
                                     ┌──────────▼───────────┐
                                     │  Hermes Agent Core   │
                                     │  SQLite + config.yaml │
                                     └──────────────────────┘
```

Full design: [DESIGN.md](./DESIGN.md).

## Relationship to upstream Hermes

This project depends on new `/v1/sessions`, `/v1/skills`, `/v1/config`, and
`/v1/profile` endpoints that we are contributing to
[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) in a
separate PR. See [DESIGN.md §5](./DESIGN.md#5-proposed-new-endpoints).

Until those land, run this against the companion branch of Hermes that includes
them.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).

Not affiliated with or endorsed by Nous Research. Hermes Agent is © Nous
Research; this UI is an independent companion project.
