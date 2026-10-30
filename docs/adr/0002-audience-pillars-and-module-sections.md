# 0002. Organise by audience, module and terminology, using Diátaxis page types

Date: 2026-10-30

Status: accepted

## Context

Readers arrive either by role ("I administer an instance") or by module ("our instance has onboarding"). Both entry points need a home. A module-first structure alone hides the core features that every instance has.

## Decision

The KB has six parts: Start here, Terminology, User guide, Administrator guide, Developer guide and Modules. Each optional module has a section whose index routes each audience to its pages; core modules are documented in the audience guides. Every page has one Diátaxis type (tutorial, how-to, reference, explanation) and does not mix types.

## Consequences

Every fact has one home and other pages link to it, so module routers only link. Authors decide the page type and audience in frontmatter, and the layout shows module requirements from `modules:`. Splitting a page by type creates more small pages.
