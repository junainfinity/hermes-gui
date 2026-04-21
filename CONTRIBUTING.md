# Contributing to Hermes Web UI

Thanks for considering a contribution. This guide covers the mechanics; for
architecture and design rationale, read [DESIGN.md](./DESIGN.md) first.

## Ground rules

- **Small PRs.** One concern per PR. If you're tempted to include a drive-by
  refactor, open a separate PR.
- **Tests required for logic changes.** UI polish without logic changes can
  ship without new tests; anything else needs coverage.
- **No regressions in lint, types, or tests.** CI runs `npm run check` —
  reproduce locally before pushing.
- **Match the existing code style.** We have ESLint + Prettier configured;
  `npm run format` before committing.

## Dev setup

```sh
git clone https://github.com/arjun/hermes-webui.git
cd hermes-webui
npm install
npm run dev       # Vite dev server on http://127.0.0.1:5173
```

For the full stack you'll also need a running Hermes with API server enabled;
see [README.md](./README.md#run-locally).

## Scripts

| Command               | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Vite dev server with HMR                        |
| `npm run build`       | Production build to `dist/`                     |
| `npm run preview`     | Serve the built bundle for smoke testing        |
| `npm run lint`        | ESLint                                          |
| `npm run typecheck`   | `tsc --noEmit`                                  |
| `npm run test`        | Vitest in watch mode                            |
| `npm run test:run`    | Vitest single run                               |
| `npm run format`      | Prettier write                                  |
| `npm run check`       | lint + typecheck + test (what CI runs)          |

## Commit messages

Conventional Commits style:

```
feat(chat): stream tool.started events into the right-rail panel
fix(sessions): handle empty title in sidebar group sort
docs(design): clarify CORS defaults for Electron bundle
```

## Architectural changes

If you're touching the store shape, the Hermes client surface, or the routing
model, open a GitHub Discussion (or update DESIGN.md in the same PR) before
writing the code. We'd rather iterate on a paragraph than on a 500-line diff.

## Upstream (Hermes) coordination

Some UI features require new endpoints. If you hit one, don't build a
client-side workaround — open an issue on
[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) and
link it from your PR here. We'll land the backend change first.

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
