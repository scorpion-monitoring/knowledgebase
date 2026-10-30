// HAND-MAINTAINED. Source: scorpion@v0.13.0 docs/architecture.md ("Deployment profiles and operations")
// and profiles/{core-only,registry,full}.ts. The matrix is the architecture's plan for each profile, so
// `full` shows modules that are not released yet; `released` on each module says which exist.
// To be replaced by generated data in K3 (`pnpm sync`).

import { modules, type ModuleId } from './modules';

/** ● included, ○ optional. A missing entry means the module is not part of the profile. */
export type Inclusion = 'included' | 'optional';

export interface Profile {
  id: string;
  name: string;
  /** `exists` profiles have profiles/<id>.ts and an image; `planned` ones do not. */
  status: 'exists' | 'planned';
  modules: Partial<Record<ModuleId, Inclusion>>;
}

const I = 'included' as const;
const O = 'optional' as const;

const core = Object.fromEntries(
  modules.filter((m) => m.kind === 'core').map((m) => [m.id, I]),
) as Partial<Record<ModuleId, Inclusion>>;

export const profiles: readonly Profile[] = [
  { id: 'core-only', name: 'core-only', status: 'exists', modules: { ...core } },
  {
    id: 'registry',
    name: 'registry',
    status: 'exists',
    modules: {
      ...core,
      'registry.organisations': I,
      'registry.services': I,
      'public-api': I,
      announcements: O,
      backup: I,
    },
  },
  {
    id: 'full',
    name: 'full',
    status: 'exists',
    modules: {
      ...core,
      'registry.organisations': I,
      'registry.services': I,
      'kpi.framework': I,
      'kpi.ingestion': I,
      'kpi.analytics': I,
      'kpi.impact': I,
      maturity: I,
      onboarding: I,
      bibliometrics: I,
      'network-graph': I,
      announcements: I,
      backup: I,
      'public-api': I,
    },
  },
  {
    id: 'nfdi-onboarding',
    name: 'nfdi-onboarding',
    status: 'planned',
    modules: {
      ...core,
      'registry.organisations': I,
      'registry.services': I,
      'kpi.framework': O,
      'kpi.ingestion': O,
      'kpi.analytics': O,
      maturity: I,
      onboarding: I,
      announcements: O,
      backup: I,
      'public-api': O,
    },
  },
  {
    id: 'kpi-tracker',
    name: 'kpi-tracker',
    status: 'planned',
    modules: {
      ...core,
      'registry.organisations': I,
      'registry.services': I,
      'kpi.framework': I,
      'kpi.ingestion': I,
      'kpi.analytics': I,
      'kpi.impact': O,
      bibliometrics: O,
      announcements: O,
      backup: I,
      'public-api': I,
    },
  },
];

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}
