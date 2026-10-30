# Scorpion Knowledge Base

The documentation site for [Scorpion](https://github.com/scorpion-monitoring/scorpion), the service registry and KPI tracker for research infrastructures. It has three audience guides (user, administrator, developer), a tool-agnostic terminology section and one section for each optional module.

Published site: <https://scorpion-monitoring.github.io/knowledgebase/>

The site is static, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## How it relates to Scorpion

The KB documents one released Scorpion version, recorded in `scorpion.json`. Released behaviour wins over every other source. Scorpion's own process (branches, changesets, ADRs) stays in the Scorpion repository, and the KB links to it. Reference data (permissions, settings, events, CLI, API) is meant to come from a Scorpion docs export; until it exists, tables are written by hand with a source comment (see `docs/backlog.md`, "Scorpion requests").

## Prerequisites

- Node 24 (see `.nvmrc`) and pnpm 10 (`corepack enable` picks the pinned version)
- Playwright Chromium: `pnpm exec playwright install chromium` (renders Mermaid diagrams at build time and runs the smoke test)
- [Vale](https://vale.sh) 3.25.1 on the `PATH`, for `pnpm check`

## Quick start

```bash
pnpm install
pnpm dev        # local server with hot reload
pnpm check      # type check, formatting, markdown lint, Vale, content checks
pnpm build      # production build, including link validation
pnpm test       # unit tests, rule fixtures and the Playwright smoke test
```

`KB_SITE` and `KB_BASE` set the site URL and base path (defaults `https://scorpion-monitoring.github.io` and `/knowledgebase`).

## More

- [CONTRIBUTING.md](CONTRIBUTING.md): branches, commits, definition of done, adding pages
- [CLAUDE.md](CLAUDE.md): information architecture and writing rules
- [docs/implementation.md](docs/implementation.md): milestone plan
- [docs/adr/](docs/adr/): decisions
- [docs/backlog.md](docs/backlog.md): deferred work

Licence: ISC, see [LICENSE](LICENSE).
