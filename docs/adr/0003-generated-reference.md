# 0003. Generate reference material from a Scorpion docs export

Date: 2026-10-30

Status: accepted

## Context

Permissions, settings and environment variables change with each module. Hand-copied tables drift from the released behaviour. Scorpion has no docs export yet (request R1).

## Decision

Reference pages are generated from a Scorpion docs export through `pnpm sync` into `src/data/generated/`, which is never edited by hand. Until the export exists, tables are written by hand from the module `README.md` files at the release tag, each with a `{/* source: … */}` comment. The content checks list every such comment.

## Consequences

The KB is correct by construction once the export exists. Until then the source comments keep the debt visible, and `sync` and `screenshots` only print that they are not available until K3.
