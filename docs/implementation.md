# Scorpion KB: Implementation Plan

Status: draft, revised 2026-10-30 to match the Scorpion repository at `v0.13.0` (M0–M11 released)
Inputs: Scorpion `FEATURES.md`, *Scorpion Rebuild: Overall Architecture*, Scorpion `implementation.md` (M0–M18), Scorpion `CLAUDE.md`, Scorpion ADRs 0001–0044, Scorpion `CHANGELOG.md`

This plan describes how the Scorpion knowledge base (KB) is built and written. It has eight milestones (K0–K7). The KB documents only released Scorpion behaviour, so content milestones wait for a Scorpion release or gate. Scorpion has moved ahead of the first draft of this plan: K2, K3 and K4 are no longer blocked, and K5 is blocked only in part (§0). K0 and K1 do not depend on Scorpion and can start at once. Sizes are relative, as in the Scorpion plan: S ≈ 1 week, M ≈ 2–3 weeks, L ≈ 4+ weeks for one writer.

---

## 0. Scorpion baseline

What the Scorpion repository has actually decided and shipped, as of `v0.13.0`. The rest of this plan is written against it. Update this section whenever `scorpion.json` moves.

**Releases.** Each Scorpion milestone is one release. M0 `v0.1.0`, M1 `v0.2.0`, M2 `v0.3.0`, M3 `v0.4.0`, M4 (with M4a) `v0.5.0`, M4b `v0.6.0`, M5 `v0.7.0`, M6 `v0.8.0`, M7 `v0.9.0`, M8 `v0.10.0`, M9 `v0.11.0`, M10 `v0.12.0`, M11 `v0.13.0`. The `since` value of a page is the release in this list that introduced the behaviour, not "the next release".

**Gates.** Gate 1 and Gate 2 are *conditionally passed* (ADR-0031, ADR-0039). Gate 3 is not reached: M12 (`kpi.impact`) and M13 (`tools/migrate-legacy`) are not built; the `tools/migrate-legacy` directory exists but is not released behaviour. M14–M18 are not started.

**Profiles that exist.** Three: `core-only`, `registry` and `full` (ADR-0030, ADR-0032). The profiles `denbi`, `nfdi` and `kpi` that earlier drafts of this plan used **do not exist**. Scorpion's architecture names the two planned example profiles `nfdi-onboarding` and `kpi-tracker`; they return "when their milestones need them". The KB documents the three existing profiles and shows the two planned ones as planned only (`draft: true`). One image per profile is built as `scorpion:<version>-<profile>`.

**Modules that exist.** Seven core modules, not six: `core.authz`, `core.settings`, `core.blob`, `core.notifications`, `core.identity`, `core.audit`, `core.ui-shell`. Optional modules released: `registry.organisations`, `registry.services`, `public-api`, `kpi.framework`, `kpi.ingestion`, `kpi.analytics`. Not yet built: `kpi.impact`, `maturity`, `onboarding`, `bibliometrics`, `network-graph`, `announcements`, `backup`. Modules ship in dependency order; the dashboard grid is part of `core.ui-shell`, its KPI widgets belong to `kpi.analytics`.

**Scorpion process the KB links to, not copies.** Branches `main`, `dev`, `feature/*`, `release/*`; a changeset on every code pull request; ADRs in `docs/adr/`; per-module `README.md` listing permissions, settings keys, events, registries and jobs (ground rule 8); `docs/security/` (authorization, authentication, sessions) and the ASVS assessments; sprint plans `docs/mN-sprint-plan.md`.

**What does not exist in Scorpion yet** (see §7 for the effect): a docs export (`scorpion docs:export`, `docs-export.zip`), journey specs named `jNN-<slug>.spec.ts`, a `docShot()` helper, the CLI command `scorpion seed` (the CLI has `start`, `worker`, `migrate`, `profile:generate` and the commands modules contribute, such as `create-admin`, `set-secret` and `rotate-secrets`), and an "About" page that shows the profile.

**Existing public surfaces the KB relies on.**

- `GET /api/v1/openapi.json` is served by every instance with `public-api`; the interactive reference is **Scalar** at `/docs/reference` and a landing page at `/docs` (ADR-0038), not Swagger UI. `pnpm openapi:diff` guards the contract against the last tag.
- The public API is read-mostly: providers, services, categories, indicators, measurements (GET and POST), and RDF reads of the KPI framework. Token scopes intersect with the owner's permissions; a write needs two scopes (`kpi.ingestion.v1.write` and `kpi.ingestion.measurement.submit`).
- Indicators follow the Research Infrastructure Metrics Ontology, RIMO 0.2.0 (ADR-0040). The KB's terminology section must cite RIMO next to the other authorities.

---

## 1. Goals and non-goals

**Goals**

1. Three audience guides (user, administrator, developer) that each stand on their own.
2. One section per optional module, so a reader of any deployment can see what applies to their instance and is routed to the right pages.
3. A user guide built from the same end-to-end journeys that Scorpion's Playwright suite tests, so the guide describes behaviour that is proven to work.
4. A tool-agnostic terminology section that defines monitoring and KPI vocabulary independently of Scorpion, and a single mapping page from Scorpion's names to those terms.
5. Reference material (permissions, settings, env variables, CLI, events, API) generated from Scorpion, never typed by hand.

**Non-goals**

- Documenting the legacy SvelteKit app or any FEATURES §5 defect.
- Documenting unreleased features as available.
- A marketing site, a blog, or user forums.
- Translation before K7. Versioned documentation (one site per Scorpion release) before Scorpion v1.0.0.

---

## 2. Decisions

Each decision gets an ADR in `docs/adr/` during K0.

| # | Decision | Reason | Alternative considered |
|---|---|---|---|
| D1 | **Separate repository** `scorpion-monitoring/scorpion-kb` | Keeps Astro and documentation tooling out of the product monorepo; writers can contribute without the Scorpion toolchain; the KB can track releases rather than every commit | `apps/kb` inside the Scorpion monorepo. Simpler access to code, but couples doc fixes to the product's changeset and release process |
| D2 | **Audience pillars + module sections + terminology**, organised by Diátaxis page types | Readers arrive either by role ("I administer an instance") or by module ("our instance has onboarding"). Both entry points need a home | Module-first only: hides the core features that every instance has |
| D3 | **Reference generated from a Scorpion docs export** (`pnpm sync`) | Permissions, settings and env variables change with each module; hand-copied tables drift | Hand-maintained tables: acceptable only until the export exists (see §7) |
| D4 | **Journeys mirror Scorpion's Playwright journey specs**; screenshots come from those runs. Today Scorpion's specs are named by feature (`register.spec.ts`, `services.spec.ts`, …), so each journey records the spec it mirrors in `journeys.ts` until Scorpion adopts the `jNN-` names (R2) | "Build on e2e journeys" made literal: the documented steps are the tested steps | KB-owned Playwright scripts only: works, but duplicates Scorpion's journeys and can drift |
| D5 | **Track the latest Scorpion release** (one pull request per release bump, as in `CLAUDE.md`); unreleased content is `draft: true`; versioned docs after v1.0.0 | Scorpion is pre-1.0 and releases once per milestone (`0.13.0` now); one current version is cheaper to keep correct | Versioned from the start: high cost for no users yet |
| D6 | **Static hosting on GitHub Pages**, published from `main`; `site` and `base` configurable | No server to operate; a custom domain can be added later without content changes | Container image behind the Scorpion proxy |

---

## 3. Definition of done

A pull request is **done** when:

1. CI is green: `pnpm check`, `pnpm build` (including link validation) and `pnpm test`.
2. Every new page has complete frontmatter, including `pageType`, `audience`, `modules`, `since` and `verifiedAgainst`.
3. Every statement about Scorpion behaviour was checked against the release in `scorpion.json`, on a running instance or in the code at that tag. Anything later is `draft: true`.
4. No permission id, setting key, env variable, event, CLI flag or API field is typed by hand where generated data exists.
5. New sidebar entries are in `src/data/navigation.ts`; affected module router pages link to the new content.
6. Journey pages match their e2e spec step for step, and screenshots are refreshed for changed steps (light and dark).
7. Terms used for the first time on a page are linked with `<Term>`; any new term is in `src/data/terms.ts`.
8. Images have meaningful alt text; headings are in order; no information is carried by colour alone.

A milestone is **done** when all its pull requests are done, its acceptance criteria hold, and the published site at `main` shows its content.

---

## 4. Milestone overview

| # | Milestone | Size | Depends on (KB) | Waits for (Scorpion) |
|---|---|---|---|---|
| K0 | Site bootstrap, tooling, information architecture skeleton | S | none | none |
| K1 | Terminology section | M | K0 | none |
| K2 | Start here + developer guide: kernel and module authoring | M | K0 | v0.2.0 (M1): **released**, write against `v0.13.0` |
| K3 | Core guides: identity, access, settings, operations | L | K1, K2 | Gate 1 (M2–M5): **conditionally passed**, released in `v0.3.0`–`v0.7.0` |
| K4 | Registry: organisations, services, public API | M | K3 | Gate 2 (M6–M8): **conditionally passed**, released in `v0.8.0`–`v0.10.0` |
| K5a | KPIs, part 1: framework, ingestion, analytics | L | K4 | M9–M11: **released** in `v0.11.0`–`v0.13.0` |
| K5b | KPIs, part 2: impact, legacy migration | M | K5a | M12, M13, Gate 3: **not built** |
| K6 | Parity modules: maturity, onboarding, bibliometrics, network graph, announcements, backup | L | K5b for the order only | M14–M18 (each module as it ships): **not started** |
| K7 | v1.0 documentation release: profile builds, versioning, German, audits | M | K6 | Gate 4, v1.0.0 |

K6 can be split by module and written as soon as each Scorpion module is released, in any order. K5 is split because Scorpion released three of its five KPI milestones before Gate 3; the KB does not wait for the gate to document `kpi.framework`, `kpi.ingestion` and `kpi.analytics`.

---

## 5. Milestones

### K0: Site bootstrap (S)

**Goal:** an empty but fully wired KB in which every later milestone only adds pages.

- Repository `scorpion-monitoring/scorpion-kb` with Node 24, pnpm 10, `.nvmrc`, `engines`, `.editorconfig`, `.gitignore`, `LICENSE` (same licence as Scorpion, ISC).
- Astro + Starlight, with Pagefind search, Mermaid rendering, `starlight-links-validator`, light and dark theme, Scorpion logo and favicon.
- Extended frontmatter schema in `src/content.config.ts` (see `CLAUDE.md`, "Frontmatter").
- Data files: `modules.ts` and `profiles.ts` filled by hand from the architecture's profile matrix and `profiles/*.ts` in the Scorpion repository (marked as hand-maintained; profiles `core-only`, `registry`, `full`, plus `nfdi-onboarding` and `kpi-tracker` flagged as planned), `journeys.ts` with the catalogue from §6.2, `terms.ts` with the term list from §6.1, `navigation.ts`.
- Components: `Term`, `ModuleBadge`, `RequiresModule`, `ProfileMatrix`, `Permission`, `Screenshot`, `JourneyMeta`, `Since`, `GeneratedTable`. The page layout override shows module badges and the "Requires" note from frontmatter.
- `pnpm new` scaffolding for journey, term, module, admin-task and developer pages, from the templates in `CLAUDE.md`.
- Skeleton: landing page with role cards; an index page for every section; a router page for every optional module (§6.3), all `draft: true` except the landing page and section indexes. Router pages of released modules lose `draft` when K4 and K5a fill them.
- Tooling: Prettier, markdownlint-cli2, Vale with a `Scorpion` style (preferred terms, banned words) and a `Terminology` style (no "Scorpion", no module ids under `terminology/`); content-check script (see `CLAUDE.md`, "Checks"); Vitest for scripts and components; Playwright smoke test on the build.
- CI (GitHub Actions): check, build, test on every pull request; deploy to GitHub Pages on merge to `main`. Branch protection on `main` (pull request required, required checks, no force push).
- Repository docs: `CLAUDE.md`, this plan as `docs/implementation.md`, `docs/backlog.md`, ADRs 0001–0006 for D1–D6, `README.md`, `CONTRIBUTING.md`.
- Open the Scorpion requests from §7 as issues in the Scorpion repository.

**Acceptance:** a clean clone passes `pnpm i && pnpm check && pnpm build && pnpm test`. The site is live on GitHub Pages and works under a non-root `base`. A page with an unknown module id, a broken link, a missing `<Term>` target or the word "Scorpion" under `terminology/` each fails CI (one fixture per rule).

### K1: Terminology (M)

**Goal:** a tool-agnostic vocabulary that the three guides can link to.

- All term pages from §6.1, written to the term template, with authoritative references.
- An overview page, "Indicator, KPI, metric, measurement: how they relate", with a Mermaid diagram: an indicator is defined by a metric, observed through measurements over reporting periods, and some indicators are chosen as KPIs.
- A results-chain page (input → activity → output → outcome → impact) that places indicator types on it.
- Disambiguation where usage is contested, stating the KB's choice. In particular: "MAPE" usually means mean absolute percentage *error* of a forecast; a dispersion measure around a series mean is a different thing and gets its own term. Scorpion keeps the legacy meaning under the name MAPE and shows it as "volatility" with a band (ADR-0043: `mean(abs(v - mean)) / abs(mean)`), so the term map must say exactly this.
- RIMO (the Research Infrastructure Metrics Ontology, 0.2.0) is an authoritative reference for indicator, measurement means, automation tool, unit and service category, and the Units Ontology for units (ADR-0040). Cite them on the matching term pages.
- `start/scorpion-terms`: one table mapping Scorpion names to terms (KPI set → indicator framework, Category → indicator framework, headline indicator (the `evaluation` of a KPI set), Stage → lifecycle stage, Provider and Consortium → the two organisation types, Measurement → measurement, necessity levels Mandatory, Recommended and Optional (RIMO's `mandatoryFor`, `recommendedFor`, `appliedTo`), volatility score → mean absolute percentage deviation, and so on). This page is not tool-agnostic and lives in `start/`.
- `<Term>` tooltips use each page's `short` definition.

**Acceptance:** every term in `terms.ts` has a page, every page passes the `Terminology` Vale style, and every reference link resolves. A reviewer with monitoring and evaluation background has read the section and has no open objections.

### K2: Start here and developer foundations (M)

**Goal:** the kernel shipped in Scorpion M1 (`v0.2.0`) is documented for module authors, against the current release. Nothing blocks this milestone.

- **Start here:** what Scorpion is; modular monolith and profiles explained for non-developers; the profile matrix (`<ProfileMatrix>`), which shows the three profiles that exist and marks `nfdi-onboarding` and `kpi-tracker` as planned; "Which modules does my instance have?"; "How to use this KB" (roles, module badges, draft and `since` markers).
- **Developer guide:**
  - Get started: dev environment (`pnpm dev`, Docker, profiles), repository tour.
  - Architecture explained: layers inside a module, build-time composition, deny by default, outbox, jobs, the seven core modules and their dependency order (ADR-0014, ADR-0019), the `public.ts` rule for cross-module calls and the `…AsSystem` trusted reads. Explains and links to the Scorpion architecture and ADRs; it does not restate their decisions.
  - Module authoring tutorial: build a minimal module end to end (manifest, `package.json` dependencies, a table with the right prefix, a migration, a service, a route with a permission, an event, a job, a registry contribution), ending in a test run under a fixture profile.
  - How-tos: declare dependencies; use `ctx`; emit and subscribe to events; declare jobs; declare and contribute to a registry; write migrations; define routes with `createRoute()`; generate a profile.
  - Process: links to Scorpion's `CONTRIBUTING.md` and `CLAUDE.md` (branches, changesets, definition of done) with a one-paragraph summary each.
- Mark each page with the release that introduced the behaviour (§0), and `verifiedAgainst` with the release in `scorpion.json`.
- The module-authoring tutorial must not rely on `scorpion seed`, which does not exist; it ends with a test run under a fixture profile (`packages/testing`).

**Acceptance:** a developer who has not seen the code completes the module-authoring tutorial against the Scorpion release in `scorpion.json` without help, and every code sample in the developer guide runs. (Code samples are extracted and run by a CI job against the pinned Scorpion release.)

### K3: Core guides (L)

**Goal:** everything an instance has regardless of profile is documented, with the first journeys and the screenshot pipeline. Gate 1 is conditionally passed (ADR-0031); documented behaviour is what `v0.13.0` ships, and the K3 pull requests re-check pages that later releases changed (the dashboard of `0.13.0`, the sessions and credentials rules of `0.6.0`).

- **Reference:** the docs export (§7, R1) does not exist. Until it does, reference tables are hand-maintained with an MDX source comment each, taken from the per-module `README.md` files at the release tag (permissions, settings keys, events, registries, jobs), `docs/security/authorization.md` (generated route matrix), the env schema and the CLI help. When the export lands, `pnpm sync` replaces them and `modules.ts` and `profiles.ts` become generated.
- **Screenshot pipeline:** pull screenshots from the export (§7, R3) once it exists. Until then `pnpm screenshots` starts the released `full` image with Postgres and Mailpit, creates the first administrator with `scorpion create-admin` and fills data through the public API or the UI. There is no `scorpion seed` command (§7, R4).
- **User guide:** journeys J01–J04 (§6.2); how-tos for profile and avatar, linked identities, own sessions ("log out everywhere"), notifications inbox and preferences, theme and language, and the **dashboard** (arranging widgets, edit mode, reset; it is a `core.ui-shell` feature, so it lives here, and the KPI widgets are linked from `kpi.analytics`).
- **Administrator guide, operate:** deployment overview by profile (`core-only`, `registry`, `full`; images `scorpion:<version>-<profile>`); install with Docker Compose; configuration reference; reverse proxy, the SvelteKit server as public origin that proxies `/api` (ADR-0027), `ORIGIN` and `BASE_PATH`; first administrator (`scorpion create-admin`, first-run token); worker mode; `/healthz`, `/readyz` and `/metrics`; logs; secrets and `SECRETS_KEY` rotation (`scorpion set-secret`, `scorpion rotate-secrets`); migrations at start; upgrading between releases using the changelog's operator notes (for example the `0.12.0` migration and the `0.13.0` rate-limit note).
- **Administrator guide, administer:** approving and rejecting registrations (the role is chosen on approval); roles and permissions; ending sessions; sign-in methods (local accounts, OIDC providers and their secrets); instance settings, including rate limits (`default` bucket); branding and legal texts; vocabularies; email transport (SMTP settings, webhook mirror) and notification status; audit log and its retention; job runs and the system routes hosted in `core.audit`.
- **Developer guide:** permissions, scoped permissions and resource policies (ADR-0014, ADR-0034); settings schemas and vocabularies; UI contributions (`ui.routes`, `ui.nav`, `ui.widget`); the `ui-kit` components; testing (Testcontainers, factories, defect regression tests).

**Acceptance:** J01–J04 match their e2e specs (checked by `pnpm check`). Following the install page from scratch produces a running `full` instance with an admin account. No page under `admin/` contains a hand-typed env variable or setting key.

### K4: Registry and public API (M)

Gate 2 is conditionally passed (ADR-0039) and the three modules are released in `0.8.0`–`0.10.0`, so this milestone can start once K3's install and identity pages exist. The staging dry run with real data is still open on Scorpion's side; do not describe migration of legacy data as available.

- Module sections for `registry.organisations`, `registry.services` and `public-api` (§6.3).
- Journeys J05–J08.
- Administrator: organisation types (`org.type`, seeded provider and consortium) and organisations; membership as a state machine (requested, approved, rejected, left) with roles `member` and `manager`; service metadata schema and wizard steps (config files validated at start); publication of services (flag `public`, permission `registry.services.service.publish`, setting `service.allowPublic`); licence data (SPDX) with its 24 h cache and bundled fallback; API rate limits and the `corsOrigins` allow-list.
- Developer: contributing `service.fieldType`, `service.wizardStep`, `service.facet`, `service.orgRole` and `service.profileContributor` entries; `org.type` and `org.usage`; resource policies `organisation.member` and `service.member`; the Schema.org JSON-LD profiles of organisations and services.
- **Public API guide** (developer guide, `api/`): authentication with a personal access token (`Authorization: Bearer`, `X-API-Key`; format `scp_<prefix>_<secret>`), scopes intersected with the owner's permissions, the list envelope (`metadata` and `result`) and 0-based pagination (`pageSize` at most 100), problem-details errors, rate limits, the additive-only stability promise and `pnpm openapi:diff`, worked examples in `curl` and Python. The instance serves its own reference (Scalar at `/docs/reference`, ADR-0038); the KB renders the same spec with `starlight-openapi` and links to that page, not the other way round.

**Acceptance:** every module router links to all its pages and journeys. The API reference matches the spec of the documented release. The `curl` examples run in CI against an instance started from the released `registry` or `full` image and filled through its own API (there is no `scorpion seed`).

### K5a: KPIs, part 1 (L)

Starts after K4. Scorpion released these modules in `0.11.0` (`kpi.framework`), `0.12.0` (`kpi.ingestion`) and `0.13.0` (`kpi.analytics`); none needs Gate 3.

- Module sections for `kpi.framework`, `kpi.ingestion`, `kpi.analytics`.
- Journeys J09, J10, J11 and J12 (J12 uses the core dashboard and the `kpi.analytics` widgets).
- Administrator: indicators (name, description, example, value type, unit, bounds, thematic category, `qualitative`, means of measurement, automation tools) and the vocabularies `kpi.unit`, `kpi.measured-by`, `kpi.automation-tool` and `kpi.service-category` (the last two start empty, ADR-0040); KPI sets, necessity and the optional RIMO service-category mapping; the evaluation (headline indicator and aggregate); the `iriBase` setting, which must be set before any identifier is shared; the RDF reads (Turtle and JSON-LD, token and public); reporting reminder (`reminders.enabled`, `reminders.dayOfMonth`, default the 6th, UTC; job `kpi.ingestion.reporting-reminder`); import templates; the volatility thresholds (`volatility.thresholds.low` 0.4 and `.high` 0.8); exporters.
- Developer: `kpi.valueType`, `ingestion.adapter`, `kpi.indicatorUsage`, `analytics.aggregate`, `analytics.score`, `analytics.exporter` contributions; `upsertBatch()` as the single write path (up to 25 000 values per batch; the public API takes 500); the `ui` export `wizardExtensions` and `showIf`; the dashboard widget contribution (`ui.widget` with `grid`, configuration schema and icon).
- User explanations in module sections: how change %, averages, cumulative series and the volatility score are calculated, with worked numbers taken from the table-driven tests in `modules/kpi-analytics/service/calc/`. State the rules of ADR-0043: a gap is never a zero, a text value is never read as a number, a range is always applied (default `1y`), a constant series has volatility exactly 0.
- Public API write path (J11): the two scopes, who may write (Admin or an approved member of the service's provider), the all-or-nothing batch and the 422 item paths. A client of the old application must read `result`, not `data`, and cannot rely on a default page size of 1 000.
- State what is *not* available: PDF export (moved to Scorpion's backlog), and any KPI-set-level analytics beyond a single service.

**Acceptance:** worked calculation examples equal the expected values in Scorpion's unit tests (checked by a script). A provider member completes J09 and J10 using only the KB.

### K5b: KPIs, part 2: impact and legacy migration (M)

Starts when Scorpion releases M12 and M13; passes Gate 3 before the migration page loses `draft`.

- Module section for `kpi.impact`; journey J13.
- Administrator: evaluation prerequisites, the read-model refresh (on `measurement.recorded` and nightly).
- Administrator, operate: **migration from the legacy Scorpion app** (`tools/migrate-legacy`): dry run, reading the report, what is changed or dropped, re-issuing personal access tokens. Written against the released tool, not against the plan in Scorpion's M13.

**Acceptance:** An administrator can run the legacy migration dry run using only the KB.

### K6: Parity modules (L)

Written module by module as each ships (Scorpion M14–M18).

- Module sections for `maturity`, `onboarding`, `bibliometrics`, `network-graph`, `announcements`, `backup`.
- Journeys J14–J18.
- Administrator: maturity model editor, versions and publishing; onboarding form fields, CAPTCHA, post-processors; citation source and refresh schedule, optional KPI write-back; announcement audiences and expiry; backup targets, keys, schedule, retention; **restore runbook** (`scorpion restore`), rehearsed on a test instance.
- Developer: `maturity.visualisation`, `onboarding.postProcessor`, `biblio.citationSource`, `graph.nodeProvider`, `graph.renderer`, `backup.target`.
- Upgrade guide for the Node 24 → 26 move in Scorpion M18, if it changes anything for operators. (Scorpion's `engines` is `>=24.0.0 <25` today.)
- Scorpion's M18 produces its own operations docs (deployment per profile, generated configuration reference, backup and restore runbook, upgrade guide) and a Grafana dashboard JSON. The KB links to the dashboard JSON and does not copy it; the runbook stays in the KB under the one-home rule.

**Acceptance:** all 18 journeys are published and match their specs. The restore runbook has been followed successfully by someone other than its author.

### K7: v1.0 documentation release (M)

Starts with Scorpion v1.0.0.

- **Profile-specific builds:** `KB_PROFILE=<name> pnpm build` produces a KB that hides module sections and module-dependent content not in that profile and marks ○ modules as optional. CI builds one artifact per profile Scorpion ships at `v1.0.0` (Scorpion's M18 says "all four profiles" without naming them; the architecture's matrix has `full`, `registry`, `nfdi-onboarding` and `kpi-tracker`, and `core-only` also exists in the repository today); `full` stays the published default.
- **Versioning:** one documentation version per Scorpion major (or minor, decided in an ADR), using a Starlight versioning plugin; the current version stays the default.
- **German translation** through Starlight i18n, starting with Start here, the user guide and terminology, matching Scorpion's "English first, German second" i18n workstream.
- Audits: accessibility (axe in Playwright on every page), search quality (top 30 expected queries return the right page first), a full `verifiedAgainst: v1.0.0` sweep.
- Feedback: an "Edit this page" link and a "Report a problem" link to KB issues on every page.

**Acceptance:** every profile build passes the checks; no page has `verifiedAgainst` older than v1.0.0; axe reports no serious or critical issues.

---

## 6. Catalogues

### 6.1 Terminology

All pages are tool-agnostic. Grouped as they appear in the sidebar:

| Group | Terms |
|---|---|
| Monitoring and evaluation | monitoring, evaluation, impact assessment, reporting, reporting period, results chain (input, activity, output, outcome, impact) |
| Indicators | indicator, key performance indicator (KPI), metric, measure, headline indicator, leading and lagging indicators, quantitative and qualitative indicators |
| Indicator frameworks | indicator framework (indicator set), necessity level (mandatory, recommended, optional), thematic category (bibliographic, usage, technical, satisfaction) |
| Data | measurement, observation (data point), value type, unit of measurement, time series, period normalisation, data provenance |
| Targets | baseline, target, threshold |
| Analysis | aggregation (sum, mean, minimum, maximum), cumulative value, percentage change, trend, volatility, mean absolute percentage deviation, mean absolute percentage error (MAPE), sparkline |
| Services and organisations | research infrastructure, service, service provider, consortium (network), service catalogue, service registry, lifecycle stage |
| Maturity | maturity model, dimension (domain), criterion (topic), maturity level, self-assessment |
| Bibliometrics | publication, persistent identifier, DOI, citation, citation count, bibliometric indicator |
| Openness | open-source licence, SPDX licence identifier, OSI approval |
| Access | authentication, authorisation, role, permission, single sign-on (OIDC), personal access token |

### 6.2 Journeys

Each journey mirrors one Scorpion Playwright spec. The target is `apps/web/e2e/journeys/jNN-<slug>.spec.ts` (§7, R2). Scorpion has no such folder today; its specs in `apps/web/e2e/` are named by feature. The column "Spec today" is the closest existing spec, taken from file names only: confirm it against the spec's steps before writing the page, and record it in `journeys.ts`.

| ID | Journey | Actors | Modules (optional) | Spec today | KB milestone |
|---|---|---|---|---|---|
| J01 | Register an account and get approved | New user, Admin | none | `register.spec.ts`, `admin-users.spec.ts` | K3 |
| J02 | Sign in with your institution (OIDC) | User | none | `oidc.spec.ts` | K3 |
| J03 | Set up your profile and link identities | User | none | `profile.spec.ts` | K3 |
| J04 | Create, use and rotate a personal access token | User | none | `profile.spec.ts` | K3 |
| J05 | Request membership in a provider | User, Admin | registry.organisations | `organisations.spec.ts` | K4 |
| J06 | Create a service with the wizard | Provider member | registry.services (kpi.framework adds the KPIs step) | `services.spec.ts` | K4 |
| J07 | Edit a service and rename its slug | Provider member | registry.services | `services.spec.ts` | K4 |
| J08 | Find services in the catalogue | User | registry.services | `services.spec.ts` | K4 |
| J09 | Submit a month of KPI values with the form | Provider member | kpi.ingestion | `data-submission.spec.ts` | K5a |
| J10 | Import KPI values from a CSV or XLSX file | Provider member | kpi.ingestion | `data-submission.spec.ts` | K5a |
| J11 | Submit KPI values through the API | Provider member (script) | kpi.ingestion, public-api | none (API tests only) | K5a |
| J12 | Read the dashboard and export the numbers (CSV or XLSX) | User | kpi.analytics | `dashboard-widgets.spec.ts` | K5a |
| J13 | Evaluate a consortium's impact | Reviewer | kpi.impact | none (M12) | K5b |
| J14 | Apply to onboard a service | Applicant (anonymous) | onboarding, maturity | none (M15) | K6 |
| J15 | Review and decide an application | Reviewer, Applicant | onboarding, maturity | none (M15) | K6 |
| J16 | Add publications and check citations | Provider member | bibliometrics | none (M16) | K6 |
| J17 | Explore the service network | User | network-graph | none (M17) | K6 |
| J18 | Read and dismiss announcements | User, Admin | announcements | none (M17) | K6 |

### 6.3 Module sections

| Module | Profiles (full / registry / nfdi-onboarding / kpi-tracker) | User pages | Admin pages | Developer pages | Released in | KB milestone |
|---|---|---|---|---|---|---|
| registry.organisations | ● / ● / ● / ● | J05; organisation pages | organisation types and organisations; memberships | `org.type`, `org.usage`; policy `organisation.member` | 0.8.0 | K4 |
| registry.services | ● / ● / ● / ● | J06–J08 | metadata schema, wizard steps, publication, licence data | `service.*` registries, policy `service.member` | 0.9.0 | K4 |
| public-api | ● / ● / ○ / ● | J11 | rate limits, CORS | API guide and reference (under developer/api) | 0.10.0 | K4 |
| kpi.framework | ● / – / ○ / ● | understanding a KPI set | indicators, KPI sets, evaluation, vocabularies, `iriBase`, RDF reads | `kpi.valueType`, `wizardExtensions` | 0.11.0 | K5a |
| kpi.ingestion | ● / – / ○ / ● | J09–J11 | reminders, import templates | `ingestion.adapter`, `upsertBatch()` | 0.12.0 | K5a |
| kpi.analytics | ● / – / ○ / ● | J12; how scores are calculated | volatility thresholds, exporters | `analytics.*` registries, `ui.widget` | 0.13.0 | K5a |
| kpi.impact | ● / – / – / ○ | J13 | evaluation prerequisites, refresh | read model and events | not released (M12) | K5b |
| maturity | ● / – / ● / – | reading a radar | model editor, versions | `maturity.visualisation` | not released (M14) | K6 |
| onboarding | ● / – / ● / – | J14, J15 | form, CAPTCHA, post-processors | `onboarding.postProcessor` | not released (M15) | K6 |
| bibliometrics | ● / – / – / ○ | J16 | citation source, schedule, KPI write-back | `biblio.citationSource` | not released (M16) | K6 |
| network-graph | ● / – / – / – | J17 | none expected | `graph.nodeProvider`, `graph.renderer` | not released (M17) | K6 |
| announcements | ● / ○ / ○ / ○ | J18 | publishing, audiences, expiry | events | not released (M17) | K6 |
| backup | ● / ● / ● / ● | none | targets, keys, schedule, restore runbook | `backup.target` | not released (M18) | K6 |

The seven core modules are in every profile, including `core-only`, and have no module section. `core-only` has no optional module. The columns `nfdi-onboarding` and `kpi-tracker` are planned profiles (§0): the KB shows them in the matrix as planned and does not claim an image for them. In the architecture's `registry` column `backup` and `announcements` are listed, but neither module exists yet.

Module ids and the profile matrix come from Scorpion's `docs/architecture.md` and `profiles/*.ts`; once the docs export exists, this table is generated.

### 6.4 Sidebar

```text
Start here          What is Scorpion · Profiles · Which modules do I have? · Scorpion term map · What's new
Terminology         (groups from §6.1)
User guide          Overview · Journeys (J01–J18) · How-to
Administrator guide Operate · Administer · Reference
Developer guide     Get started · Architecture · Module authoring · Public API · Reference
Modules             one collapsed group per module in §6.3
```

---

## 7. Requests to the Scorpion project

The KB depends on these Scorpion changes. None existed when the status column was written (2026-10-30), and Scorpion's own plan and backlog do not mention them yet, so they are still to be filed. They are filed as issues in K0 and proposed for Scorpion's `docs/backlog.md`. Until each exists, the KB uses the stated fallback.

| # | Request | Needed by | Status in Scorpion at `v0.13.0` | Fallback until then |
|---|---|---|---|---|
| R1 | `scorpion docs:export` and a release asset `docs-export.zip`: module manifests (permissions, settings JSON Schemas, events, registries, jobs, dependencies), the env Zod schema as JSON Schema, CLI help, the public OpenAPI spec, the profile matrix | K3 | Not present. The module `README.md` files, `docs/security/authorization.md` and `/api/v1/openapi.json` exist and are the sources | Hand-maintained data from those, with source comments |
| R2 | Journey specs named `jNN-<slug>.spec.ts` with one `test.step` per user-visible step, and the step list included in the export | K3 | Not present. Specs are named by feature, and no step list is exported | Steps written from the closest existing spec or a manual walkthrough; check disabled |
| R3 | A `docShot()` helper in Scorpion's e2e journeys that captures light and dark screenshots at a fixed viewport, collected as a release artifact | K3 | Not present | `pnpm screenshots` in the KB |
| R4 | `scorpion seed --demo` per profile with realistic, non-personal demo data | K3 | Not present. There is no `scorpion seed`; `pnpm dev` has its own dev script, and `scorpion create-admin` makes the first administrator | KB seed script through the public API and the UI |
| R5 | A way for users to see the instance's profile and modules in the UI (for example an "About" page) | K3 | Not present. A signed-in user can see the effect (navigation is filtered by profile and permission) but no page names the profile | "Ask your administrator" on the "Which modules do I have?" page |

---

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scorpion changes faster than the KB is updated | Pages describe old behaviour | Every release bump in `scorpion.json` comes with the generated-data diff; `verifiedAgainst` makes stale pages visible |
| The Scorpion requests in §7 are not prioritised | Hand-maintained reference drifts | Fallbacks keep the KB usable; the content checks flag every source comment so the debt stays visible |
| Terminology is contested across communities | Readers reject definitions | State the community and source for each definition; record the KB's choice; external reviewer in K1 |
| Duplicate content between guides and module sections | Contradictions | "One home per fact" rule; router pages only link |
| Single writer | K3–K6 run in sequence | K6 is split by module; K1 and K2 are not blocked and K5a can start after K4 |
| Scorpion is ahead of the KB (13 releases already) | Pages written late describe several releases at once, and `since` values need archaeology | Take `since` from the release list in §0 and the changelog; write K2–K5a against the latest release, not release by release |
| Conditional gates: Gate 1 and Gate 2 have open lines (second-pass review, staging dry run) | Behaviour documented as stable may still change | Keep `verifiedAgainst` current; do not document the staging migration; re-check core pages at the release that clears Gate 1 |
| Plans in Scorpion's `implementation.md` for unbuilt modules (M12–M18) change before release | Draft pages describe the wrong behaviour | Write nothing for M12–M18 beyond router skeletons until the module is released; never copy from the plan |

---

## 9. After K7 (backlog, not planned)

Interactive API explorer with a sandbox instance, video walkthroughs of the main journeys, a printable PDF of the administrator guide, deployment-specific KB builds with each instance's own branding, and translated terminology for further languages.
