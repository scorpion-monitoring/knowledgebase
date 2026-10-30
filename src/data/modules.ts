// HAND-MAINTAINED. Source: scorpion@v0.13.0 docs/architecture.md ("Core modules", "Plugin modules"),
// profiles/*.ts and each released module's package.json (workspace dependencies).
// `dependsOn` lists only the other modules a module needs among those named here; core dependencies
// of optional modules are implied. For modules not yet released, `dependsOn` follows the "Listens to"
// column of architecture.md and is marked `released: false`.
// To be replaced by generated data in K3 (`pnpm sync`).

export type ModuleKind = 'core' | 'optional';

export interface ScorpionModule {
  id: string;
  name: string;
  kind: ModuleKind;
  /** Module ids this module needs (core modules only list other core modules). */
  dependsOn: readonly string[];
  /** Directory under `src/content/docs/modules/` (dots become dashes). */
  dir: string;
  /** Release that introduced the module, or undefined while it is planned. */
  since?: string;
  released: boolean;
}

const dir = (id: string) => id.replaceAll('.', '-');

function mod(
  id: string,
  name: string,
  kind: ModuleKind,
  dependsOn: string[],
  since?: string,
): ScorpionModule {
  return { id, name, kind, dependsOn, dir: dir(id), since, released: since !== undefined };
}

export const modules = [
  mod('core.authz', 'Authorisation', 'core', []),
  mod('core.settings', 'Settings', 'core', ['core.authz']),
  mod('core.blob', 'Files', 'core', ['core.authz', 'core.settings']),
  mod('core.notifications', 'Notifications', 'core', ['core.authz', 'core.settings']),
  mod('core.identity', 'Identity', 'core', [
    'core.authz',
    'core.blob',
    'core.notifications',
    'core.settings',
  ]),
  mod('core.audit', 'Audit', 'core', ['core.authz', 'core.identity', 'core.settings']),
  mod('core.ui-shell', 'User interface shell', 'core', ['core.authz', 'core.settings']),
  mod('registry.organisations', 'Organisations', 'optional', [], 'v0.8.0'),
  mod('registry.services', 'Services', 'optional', ['registry.organisations'], 'v0.9.0'),
  mod('public-api', 'Public API', 'optional', [], 'v0.10.0'),
  mod('kpi.framework', 'KPI framework', 'optional', ['registry.services'], 'v0.11.0'),
  mod(
    'kpi.ingestion',
    'KPI ingestion',
    'optional',
    ['kpi.framework', 'registry.organisations', 'registry.services'],
    'v0.12.0',
  ),
  mod(
    'kpi.analytics',
    'KPI analytics',
    'optional',
    ['kpi.framework', 'kpi.ingestion', 'registry.services'],
    'v0.13.0',
  ),
  mod('kpi.impact', 'KPI impact', 'optional', ['kpi.ingestion']),
  mod('maturity', 'Maturity', 'optional', []),
  mod('onboarding', 'Onboarding', 'optional', ['registry.services', 'maturity']),
  mod('bibliometrics', 'Bibliometrics', 'optional', ['registry.services']),
  mod('network-graph', 'Network graph', 'optional', []),
  mod('announcements', 'Announcements', 'optional', []),
  mod('backup', 'Backup', 'optional', []),
] as const satisfies readonly ScorpionModule[];

export type ModuleId = (typeof modules)[number]['id'];

export const moduleIds = modules.map((m) => m.id) as [ModuleId, ...ModuleId[]];
export const coreModules = modules.filter((m) => m.kind === 'core');
export const optionalModules = modules.filter((m) => m.kind === 'optional');

export function getModule(id: string): ScorpionModule | undefined {
  return modules.find((m) => m.id === id);
}

export function isModuleId(id: string): id is ModuleId {
  return modules.some((m) => m.id === id);
}
