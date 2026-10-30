# CLAUDE.md

Guidance for Claude (and other agents) working in the Scorpion knowledge base (KB) repository.

## What this project is

The Scorpion KB is the documentation site for Scorpion, the service registry and KPI tracker for research infrastructures (de.NBI, NFDI). It is a static site built with **Astro + Starlight**. It has six parts:

| Part | Audience | What it contains |
|---|---|---|
| **Start here** | Everyone | What Scorpion is, profiles, how to find out which modules an instance has, the Scorpion term map |
| **Terminology** | Everyone | Tool-agnostic definitions: monitoring, KPI, indicator, metric, measurement and related terms |
| **User guide** | People who use a Scorpion instance | End-to-end journeys (registration, service creation, membership request, KPI submission, …) |
| **Administrator guide** | Operators and instance admins | Deployment, configuration, users, roles, settings, operations |
| **Developer guide** | Module authors, contributors, API clients | Architecture, kernel, module authoring, public API |
| **Modules** | All three audiences | One section per optional module, routing each audience to the right pages |

Source documents, in order of precedence:

1. **The Scorpion release this KB documents.** Its tag is in `scorpion.json` (`{"documents": "vX.Y.Z"}`). Behaviour of the released code wins over everything else.
2. The Scorpion repository docs at that tag: `docs/FEATURES.md`, `docs/architecture.md`, `docs/implementation.md`, `docs/adr/`, `CONTRIBUTING.md`, `CHANGELOG.md` and each module's `README.md` (permissions, settings keys, events, registries, jobs). A module that is only in Scorpion's plan is not released behaviour.
3. This repository: `docs/implementation.md` (KB milestone plan, definition of done, and §0 "Scorpion baseline" with what Scorpion has actually shipped) and `docs/adr/` (KB decisions).

If a KB page and the released Scorpion disagree, fix the page. If the released behaviour looks like a defect, open an issue in the Scorpion repository and do **not** document the defect as intended behaviour.

Before starting a task, find the KB milestone it belongs to in `docs/implementation.md` and stay inside its scope.

## Stack

Node 24 LTS, pnpm 10 · Astro + Starlight (latest stable, pinned exactly in the lockfile) · MDX · Pagefind (Starlight's built-in search) · Mermaid rendered to SVG at build time · `starlight-links-validator` · `starlight-openapi` (from K4) · Vale, markdownlint-cli2, Prettier · Vitest (scripts and components) · Playwright (screenshots and smoke test).

Do not add a dependency without saying why in the pull request. The site must stay fully static: no server, no client-side analytics, no third-party embeds, no fonts or scripts from a CDN.

## Repository layout

```text
astro.config.mjs          Starlight config; the sidebar is built from src/data/navigation.ts
scorpion.json             the Scorpion release this KB documents
src/content.config.ts     docs collection with the extended frontmatter schema
src/content/docs/
  index.mdx               landing page: pick your role, find your modules
  start/                  what is Scorpion, profiles, find your modules, Scorpion term map, what's new
  terminology/            one page per term or term group (tool-agnostic)
  user/                   index, journeys/jNN-*.mdx, how-to/ for core features
  admin/                  operate/, administer/, reference/
  developer/              get-started/, architecture/, module-authoring/, api/, reference/
  modules/<module-dir>/   index.mdx, user/, admin/, developer/, reference.mdx
src/data/
  modules.ts              module catalogue (id, name, kind, dependsOn, profiles)
  profiles.ts             profile matrix (● included, ○ optional)
  journeys.ts             journey catalogue (id, title, actors, modules, e2e spec)
  terms.ts                preferred terms and forbidden synonyms (feeds Vale)
  navigation.ts           sidebar definition
  generated/              written by `pnpm sync`; never edit by hand
src/components/           Term, ModuleBadge, RequiresModule, ProfileMatrix, Permission,
                          Screenshot, JourneyMeta, Since, GeneratedTable
src/assets/screenshots/<journey-id>/
scripts/                  sync, new, screenshots, content checks
styles/                   Vale styles (Scorpion, Terminology)
tests/                    Vitest for scripts and components, Playwright smoke test
docs/                     implementation.md, adr/, backlog.md (repository docs, not published)
```

Module directories use the Scorpion package naming: the id `kpi.ingestion` becomes `modules/kpi-ingestion/`.

## Commands

```bash
pnpm i                                   # install
pnpm dev                                 # local dev server with hot reload
pnpm build                               # production build (includes link validation)
pnpm preview                             # serve the built site
pnpm check                               # astro check + Prettier + markdownlint + Vale + content checks
pnpm test                                # Vitest (scripts, components) + Playwright smoke test on the build
pnpm sync --ref vX.Y.Z                   # pull the Scorpion docs export into src/data/generated/
pnpm screenshots --journey j06           # refresh screenshots (see "Screenshots")
pnpm new journey j06 "Create a service"  # scaffold a page from a template
pnpm new term indicator
pnpm new module kpi.ingestion
pnpm new admin-task configure-oidc
```

Run `pnpm check` and `pnpm build` before you say a task is finished.

## Information architecture (hard rules)

1. **One home per fact.** Every piece of content has exactly one home. Everywhere else links to it. Never copy a paragraph between pages.

   | Content | Home |
   |---|---|
   | Tool-agnostic definition of a term | `terminology/` |
   | How a Scorpion name maps to a term (for example "KPI set" → indicator framework) | `start/scorpion-terms` |
   | A user task from start to finish, possibly across modules | `user/journeys/` |
   | A user how-to for a core feature (profile, tokens, notifications) | `user/how-to/` |
   | Deploying, operating and configuring Scorpion itself | `admin/operate/` |
   | Administering users, roles, settings, vocabularies, audit, jobs | `admin/administer/` |
   | A module-specific task or explanation for one audience | `modules/<m>/{user,admin,developer}/` |
   | Kernel, architecture explanations, module authoring, public API usage | `developer/` |
   | Permissions, settings keys, events, registries, jobs, env variables, CLI, API | generated reference pages |
   | Scorpion's own process (branches, changesets, definition of done) | the Scorpion repository; the KB links to it |

2. **Core modules have no module section.** The seven `core.*` modules (`core.authz`, `core.settings`, `core.blob`, `core.notifications`, `core.identity`, `core.audit`, `core.ui-shell`) are in every profile, including `core-only`, so they are documented directly in the audience guides.
3. **Every optional module has a module section**, even if it is in every profile that has optional modules (`registry.organisations`, `registry.services`). The section structure is fixed:
   - `index.mdx`: the **router**. What the module does in two sentences, the profile matrix row, dependencies, and one card per audience linking to that audience's pages, including the user journeys that involve the module.
   - `user/`, `admin/`, `developer/`: only pages that belong to this module alone. Omit a folder that would be empty.
   - `reference.mdx`: generated permissions, settings, events, registries and jobs of the module.
4. **Journeys live in the user guide, not in module sections.** A journey crosses modules; the module routers link to it.
5. **Declare module dependence in frontmatter.** A page that needs an optional module lists it in `modules:`. The page layout then shows the module badges and a "Requires" note on its own. A step or paragraph inside a page that needs a module is wrapped in `<RequiresModule id="…">`. Never write "if your instance has X" by hand.
6. **The sidebar comes from `src/data/navigation.ts`.** Do not edit the sidebar in `astro.config.mjs`. A new page that should appear in the sidebar is added to `navigation.ts` in the same commit.
7. **Diátaxis.** Each page is one of four types and says so in `pageType`: `tutorial` (journeys, the module-authoring walkthrough), `how-to` (one task), `reference` (lookup, mostly generated), `explanation` (concepts, architecture, terminology). Do not mix types on one page; split and link instead.

## Frontmatter

The schema is defined in `src/content.config.ts` (Starlight's `docsSchema` extended with Zod). The build fails on invalid frontmatter.

```yaml
---
title: Submit KPI values with the form
description: Enter one month of KPI values for a service you maintain.  # required, ≤ 160 chars
pageType: tutorial            # tutorial | how-to | reference | explanation
audience: user                # user | admin | developer | all
modules: [kpi.ingestion, kpi.framework]   # optional modules this page needs; [] for core only
roles: [User]                 # roles or permissions the reader needs, if any
journey: j09                  # journey pages only; must exist in src/data/journeys.ts
since: v0.5.0                 # first Scorpion release with this behaviour
verifiedAgainst: v0.5.0       # Scorpion release the page was last checked against
draft: false                  # true for content about unreleased behaviour
---
```

Term pages add `term`, `short` (the one-sentence definition used by `<Term>` tooltips), `aliases` and `related`.

## Writing rules

**Language and tone**

- British English with -ise spelling, matching the Scorpion documents (organisation, authorisation, licence). Code identifiers keep their own spelling.
- Plain words, short sentences, active voice, present tense. Address the reader as "you" in guides.
- Headings in sentence case. One idea per paragraph.
- No "simply", "just", "easy", "obviously". No marketing language.
- UI labels in **bold**, exactly as they appear in the released UI. Code, paths, env variables, permission ids and setting keys in `code`.
- Use the preferred term from `src/data/terms.ts`. Vale flags forbidden synonyms (for example "log in" as a noun, "KPI-set", "Organization").
- Link a term to its terminology page with `<Term id="…">` on its first use on a page, and only there.

**Accuracy**

- Document only behaviour of the release in `scorpion.json`. Content about anything later is `draft: true` (excluded from production builds) until that release exists.
- Never document a defect from Scorpion's `FEATURES.md` §5 or a legacy-app behaviour as current behaviour.
- Never invent a permission id, setting key, env variable, CLI flag, event name or API field. Take them from `src/data/generated/` through `<GeneratedTable>`, `<Permission>` and similar components. Until the generated data exists for an item, cite its source in an MDX comment, for example `{/* source: scorpion@v0.2.0 packages/kernel/README.md */}`, so the check can find it later.
- When you are unsure how the released app behaves, check it on a running instance (`pnpm screenshots` starts one) or ask. Do not guess.
- Update `verifiedAgainst` whenever you check a page against a newer release.

**Terminology section (tool-agnostic)**

- No mention of Scorpion, its UI labels, module ids, roles or screens anywhere under `terminology/`. Vale enforces this. The mapping to Scorpion lives in `start/scorpion-terms`.
- Every term page has: a one-sentence definition (≤ 30 words, also in `short`); an explanation; a generic example from research-infrastructure monitoring; a "Not to be confused with" list; and references to authoritative sources (standards, peer-reviewed or institutional glossaries) with working links.
- Where common usage disagrees between communities, say so and state which usage the KB follows. Do not pretend a contested term has one definition.

**Journeys**

- Each journey has an id `jNN` from `src/data/journeys.ts` and mirrors one Scorpion Playwright journey spec. The `<Steps>` on the page match the spec's `test.step` titles one to one, in order. `pnpm check` compares them once the Scorpion docs export contains the step list. Until Scorpion names its specs `jNN-<slug>.spec.ts`, the spec each journey mirrors is recorded in `src/data/journeys.ts`.
- A journey states its actors (for example "Applicant" and "Reviewer"), preconditions, the result, and what can go wrong. Steps done by a different actor say so in the step heading.
- Screenshots appear only in journeys and only for steps where the screen is not obvious from the text.

**Diagrams and images**

- Diagrams are Mermaid in the page source, never images of diagrams.
- Every image has alt text that says what the reader should notice, not what the image is.
- Screenshots come in light and dark variants and are shown with `<Screenshot>`.

## Templates

`pnpm new` creates pages from these templates. Keep their headings.

**Journey** (`user/journeys/jNN-*.mdx`): Overview (one paragraph) · Before you start (actors, roles, modules, data you need) · Steps (`<Steps>`, one per e2e step) · Result · If something goes wrong · Related.

**Term** (`terminology/*.mdx`): Definition · Explanation · Example · Not to be confused with · References.

**Module router** (`modules/<m>/index.mdx`): What it does · Included in profiles (`<ProfileMatrix module="…">`) · Depends on · For users · For administrators · For developers.

**Admin task** (`admin/**`, `modules/<m>/admin/*`): Goal · Before you start · Steps · Check that it worked · Undo or roll back · Related settings (generated).

**Developer page**: Goal or concept · How it works · Example (complete, runnable) · Rules and pitfalls · Reference links.

## Generated data

- `pnpm sync --ref vX.Y.Z` downloads the Scorpion docs export for that release (module manifests, env schema, CLI help, OpenAPI spec, journey step lists, journey screenshots) into `src/data/generated/` and updates `scorpion.json`.
- Never edit files in `src/data/generated/`. If generated data is wrong, fix it in Scorpion.
- Until the Scorpion export exists, `src/data/modules.ts` and `profiles.ts` are maintained by hand from Scorpion's `docs/architecture.md` (profile matrix) and `profiles/*.ts`, and marked as such in a header comment. Profiles that exist are `core-only`, `registry` and `full`; `nfdi-onboarding` and `kpi-tracker` are planned only and are marked planned, never documented as deployable.
- The same applies to reference tables: take them from the module `README.md` files at the release tag and cite the source in an MDX comment.

## Screenshots

- Preferred source: the screenshots Scorpion's journey specs produce in its release CI, pulled in by `pnpm sync`.
- Fallback until then: `pnpm screenshots` starts the released Scorpion image of the given profile with Postgres and Mailpit via Docker Compose, creates the first administrator with `scorpion create-admin`, fills data through the public API or the UI (Scorpion has no `scorpion seed` command yet), and captures each step in light and dark mode at a fixed viewport into `src/assets/screenshots/<journey>/`.
- Screenshots never show real personal data. Use only data created for the screenshots.

## Checks

`pnpm check` and CI run, and must stay green:

- `astro check`, Prettier, markdownlint, Vale (style, preferred terms, no "Scorpion" under `terminology/`);
- frontmatter schema (at build);
- internal and anchor links (`starlight-links-validator`, at build);
- content checks: every optional module in `modules.ts` has a router page; every journey in `journeys.ts` has exactly one page and vice versa; every `modules:` entry is a known module; every `<Term id>` exists; journey steps match the export; no `draft: false` page has a `since` later than `scorpion.json`;
- Playwright smoke test on the built site: the landing page, search and one page per section render.

Never weaken, skip or disable a check to make it pass. Never add a Vale or markdownlint exception without a comment explaining why.

## Working style

- Keep changes inside the current KB milestone. Put anything else in `docs/backlog.md`.
- **Branches:** `main` is published on every merge. Work on `feature/<kN>-<topic>` (lower-case kebab case, for example `feature/k1-terminology-indicators`) and open a pull request into `main`. Never commit to `main` directly.
- **Commits:** `<area>: <imperative summary>`. Areas: `terminology`, `start`, `user`, `admin`, `developer`, `modules/<module-id>`, `site`, `ci`, `docs`. Example: `modules/kpi-ingestion: add file import admin page`.
- No changesets: the KB has no versioned consumers. Instead, each Scorpion release gets a short "What's new" entry in `start/whats-new.mdx` in the pull request that moves `scorpion.json` to that release.
- When a Scorpion release changes behaviour, update every affected page in the same pull request that bumps `scorpion.json`. Use the generated-data diff from `pnpm sync` to find them.
- If a Scorpion requirement or behaviour looks wrong, stop and ask rather than documenting a guess. Record KB decisions that change this structure in an ADR under `docs/adr/`.
