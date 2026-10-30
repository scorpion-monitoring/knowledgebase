# Contributing

Read [CLAUDE.md](CLAUDE.md) for the information architecture and writing rules, and [docs/implementation.md](docs/implementation.md) for the milestone each task belongs to. Stay inside that milestone; put anything else in [docs/backlog.md](docs/backlog.md).

## Branches and commits

- `main` is protected and published on every merge. Never commit to it directly.
- Work on `feature/<kN>-<topic>` (lower-case kebab case, for example `feature/k1-terminology-indicators`) and open a pull request into `main`.
- Commit messages are `<area>: <imperative summary>`. Areas: `terminology`, `start`, `user`, `admin`, `developer`, `modules/<module-id>`, `site`, `ci`, `docs`. Example: `modules/kpi-ingestion: add file import admin page`.
- No changesets: the KB has no versioned consumers. A pull request that moves `scorpion.json` to a new release adds an entry to `start/whats-new.mdx` and updates every affected page.

## Definition of done

A pull request is done when:

1. CI is green: `pnpm check`, `pnpm build` (including link validation) and `pnpm test`.
2. Every new page has complete frontmatter, including `pageType`, `audience`, `modules`, `since` and `verifiedAgainst`.
3. Every statement about Scorpion behaviour was checked against the release in `scorpion.json`, on a running instance or in the code at that tag. Anything later is `draft: true`.
4. No permission id, setting key, env variable, event, CLI flag or API field is typed by hand where generated data exists.
5. New sidebar entries are in `src/data/navigation.ts`; affected module router pages link to the new content.
6. Journey pages match their e2e spec step for step, and screenshots are refreshed for changed steps (light and dark).
7. Terms used for the first time on a page are linked with `<Term>`; any new term is in `src/data/terms.ts`.
8. Images have meaningful alt text; headings are in order; no information is carried by colour alone.

## Run the checks

```bash
pnpm check   # astro check, Prettier, markdownlint, Vale, content checks
pnpm build   # production build with link validation
pnpm test    # Vitest (data, scripts, components, rule fixtures) and the Playwright smoke test
```

Vale is a pinned binary (3.25.1). The Vale rules in `styles/Scorpion` and `styles/Terminology` are generated from `src/data/terms.ts`: after changing that file run `pnpm vale:gen` and commit the result, or CI fails.

Never weaken, skip or disable a check to make it pass. A Vale or markdownlint exception needs a comment that says why.

## Write links

Write internal links as root-absolute paths without the base, for example `[profiles](/start/profiles/)`. A build step adds the configured base path, and the link validator checks the result. Relative links are rejected. Link to published pages only: a link to a draft page fails the production build.

## Add a page

`pnpm new` creates a page from the templates in `CLAUDE.md`. It checks ids against the data files, refuses to overwrite a page and adds the page to `src/data/navigation.ts` where that file lists pages by hand. New pages are drafts.

```bash
pnpm new journey j06                       # id from src/data/journeys.ts
pnpm new term indicator                    # id from src/data/terms.ts
pnpm new module kpi.ingestion              # optional module from src/data/modules.ts
pnpm new admin-task configure-oidc "Configure OIDC" --section administer
pnpm new developer write-a-migration --section module-authoring
pnpm new admin-task import-templates --module kpi.ingestion   # module-specific page
```

A new journey, term or module needs its entry in `journeys.ts`, `terms.ts` or `modules.ts` first.
