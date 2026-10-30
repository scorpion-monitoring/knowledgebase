# 0005. Track the latest Scorpion release

Date: 2026-10-30

Status: accepted

## Context

Scorpion is pre-1.0 and releases once per milestone. Versioned documentation costs a lot for no users yet. One current version is cheaper to keep correct.

## Decision

The KB documents the release in `scorpion.json`. One pull request moves it to a new release, updates every affected page and adds a "What's new" entry. Content about unreleased behaviour is `draft: true` and left out of production builds. Versioned documentation is considered after Scorpion v1.0.0.

## Consequences

Readers see one current version. Pages carry `since` and `verifiedAgainst`, so stale pages are visible. Readers of an older Scorpion release cannot find matching documentation before versioning exists.
