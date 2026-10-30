# 0001. Keep the KB in a separate repository

Date: 2026-10-30

Status: accepted

## Context

Scorpion is a product monorepo with its own toolchain, changesets and release process. The KB needs Astro and documentation tooling, and writers should be able to contribute without the Scorpion toolchain. The KB should track Scorpion releases, not every commit. The first draft of the plan called the repository `scorpion-monitoring/scorpion-kb`.

## Decision

The KB lives in its own repository, `scorpion-monitoring/knowledgebase`. (The repository name differs from the draft name `scorpion-kb`; the actual name is authoritative.) The alternative, `apps/kb` inside the Scorpion monorepo, gives simpler access to code but couples documentation fixes to the product's changeset and release process.

## Consequences

Documentation tooling stays out of the product repository. The KB needs its own CI, branch protection and release link: `scorpion.json` names the Scorpion release it documents. Access to Scorpion code is by reading its repository and, later, a docs export (see the backlog).
