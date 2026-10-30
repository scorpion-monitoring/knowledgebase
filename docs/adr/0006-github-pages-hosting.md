# 0006. Host the KB on GitHub Pages

Date: 2026-10-30

Status: accepted

## Context

The KB is static and has no server-side needs. Operating a server for it adds cost without benefit. A custom domain may come later.

## Decision

The KB is published to GitHub Pages from `main` by a GitHub Actions workflow. `site` and `base` come from `KB_SITE` and `KB_BASE`, defaulting to `https://scorpion-monitoring.github.io` and `/knowledgebase`, and nothing assumes `/`. A container image behind the Scorpion proxy was considered.

## Consequences

There is no server to operate, and a custom domain needs only a configuration change. Internal links are written without the base and a build step adds it. Every merge to `main` is published, which is why `main` is protected.
