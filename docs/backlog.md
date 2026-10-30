# Backlog

Work that is outside the current milestone. Move an item into a milestone in `implementation.md` before starting it.

## Scorpion requests

Filed in `scorpion-monitoring/scorpion` on 2026-10-30. Fallbacks are in `implementation.md` §7.

| # | Request | Issue |
|---|---|---|
| R1 | `scorpion docs:export` and `docs-export.zip` | [#132](https://github.com/scorpion-monitoring/scorpion/issues/132) |
| R2 | Journey specs named `jNN-<slug>.spec.ts` with one `test.step` per step | [#133](https://github.com/scorpion-monitoring/scorpion/issues/133) |
| R3 | `docShot()` helper for light and dark screenshots | [#134](https://github.com/scorpion-monitoring/scorpion/issues/134) |
| R4 | `scorpion seed --demo` | [#135](https://github.com/scorpion-monitoring/scorpion/issues/135) |
| R5 | Show the instance profile and modules in the UI | [#136](https://github.com/scorpion-monitoring/scorpion/issues/136) |

## Later

- **Logo.** The Scorpion repository at `v0.13.0` has no SVG logo, so the KB uses Starlight's default favicon and no logo. Add one when Scorpion publishes it.
- **British English spelling check.** K0 has no spelling check. Add a Vale spelling rule with a British dictionary and an accept list built from `terms.ts`.
- **`User` role name under `terminology/`.** The Terminology Vale style flags `Admin` and `Reviewer` but not `User`, because the capitalised word is too common. Revisit with a smarter rule.
- **Links to draft pages.** The landing page cards link to the Modules index instead of "Which modules does my instance have?" (a draft until K2). Point the card at that page when it is published.
- **Journey role data.** `roles` in `journeys.ts` lists only roles the journey names (Admin, Reviewer). Complete it in K3 when the journeys are checked against the specs.
- **Module `dependsOn` for unreleased modules.** Taken from the "Listens to" column of Scorpion's architecture; replace with generated data in K3.
- **Typed hook for `Permission`.** Reads `src/data/generated/permissions.json` once `pnpm sync` writes it (K3).
- **Sitemap and canonical URLs** use `KB_SITE`; revisit when a custom domain is added.
- **Astro `markdown.processor` and Playwright in builds.** Mermaid rendering needs Chromium at build time, so every build host must run `playwright install chromium`. Consider a pre-rendered cache if build time grows.

## Found in K1

- **MDX source comments and markdownlint.** `{/* source: … */}` triggers MD037 (spaces inside emphasis markers). K1 writes `{/*source: … */}` without the space; the content check accepts both. Decide on one form and update `CLAUDE.md`.
- **Reference titles with a flagged word.** The `Terminology` Vale style rejects "Scorpion", so the title of the de.NBI KPI paper (Feser et al. 2026) is shortened with "[…]" in the references. Consider a scope that ignores reference lists.
- **ISO 9000:2026.** Pages cite the 2015 clause numbers (3.11.2 to 3.11.4), checked in a public copy. Check the 2026 numbering in a licensed copy and update.
- **Weak or unverified sources.** `trend`, `volatility`, `cumulative-value` (glossary-level only), `service-provider` and `consortium` (no primary source), the service level statement on `target` (no source), and the OECD glossary 2nd edition (403 to bots). Replace when better sources are found.
- **NIST SP 800-63-4** supersedes 800-63-3 (cited on `authentication`, `single-sign-on`). Decide whether to cite both.
- **Scorpion observations.** README for `kpi.analytics` says a constant series scores exactly 0; the code returns "n/a" for a constant series of zeros. "Category" has three meanings; "KPI" and "indicator" are mixed on screens. Consider raising these in the Scorpion repository.
