# 0004. Journeys mirror Scorpion's Playwright journey specs

Date: 2026-10-30

Status: accepted

## Context

The user guide should describe behaviour that is proven to work. Scorpion's specs are named by feature (`register.spec.ts`, `services.spec.ts`), not as journeys, and no step list is exported (requests R2 and R3).

## Decision

Each journey `jNN` mirrors one Scorpion Playwright journey spec. The `<Steps>` on the page match the spec's `test.step` titles one to one. Screenshots come from those runs. Until Scorpion adopts the `jNN-<slug>.spec.ts` names, `src/data/journeys.ts` records the closest existing spec.

## Consequences

The documented steps are the tested steps. The step comparison in `pnpm check` is implemented but skipped, with a visible notice, until an export with step lists exists. KB-owned Playwright scripts would work but duplicate Scorpion's journeys and can drift, so they are only the screenshot fallback.
