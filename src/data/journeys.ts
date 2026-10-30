// Journey catalogue from docs/implementation.md §6.2. Each journey mirrors one Scorpion Playwright spec.
// `plannedSpec` is the target name (Scorpion request R2); `specToday` is the closest existing spec in
// scorpion@v0.13.0 apps/web/e2e/ (taken from file names only: confirm against the steps before writing).

import type { ModuleId } from './modules';

export interface Journey {
  id: string;
  slug: string;
  title: string;
  actors: readonly string[];
  /** Scorpion roles the actors need, where the journey names one. */
  roles: readonly string[];
  /** Optional modules the journey needs. */
  modules: readonly ModuleId[];
  plannedSpec: string;
  specToday: readonly string[];
  milestone: string;
}

function j(
  n: number,
  slug: string,
  title: string,
  actors: string[],
  modules: ModuleId[],
  specToday: string[],
  milestone: string,
  roles: string[] = [],
): Journey {
  const id = `j${String(n).padStart(2, '0')}`;
  return {
    id,
    slug,
    title,
    actors,
    roles,
    modules,
    plannedSpec: `apps/web/e2e/journeys/${id}-${slug}.spec.ts`,
    specToday,
    milestone,
  };
}

export const journeys: readonly Journey[] = [
  j(
    1,
    'register-and-get-approved',
    'Register an account and get approved',
    ['New user', 'Admin'],
    [],
    ['register.spec.ts', 'admin-users.spec.ts'],
    'K3',
    ['Admin'],
  ),
  j(
    2,
    'sign-in-with-oidc',
    'Sign in with your institution (OIDC)',
    ['User'],
    [],
    ['oidc.spec.ts'],
    'K3',
  ),
  j(
    3,
    'set-up-profile',
    'Set up your profile and link identities',
    ['User'],
    [],
    ['profile.spec.ts'],
    'K3',
  ),
  j(
    4,
    'personal-access-token',
    'Create, use and rotate a personal access token',
    ['User'],
    [],
    ['profile.spec.ts'],
    'K3',
  ),
  j(
    5,
    'request-membership',
    'Request membership in a provider',
    ['User', 'Admin'],
    ['registry.organisations'],
    ['organisations.spec.ts'],
    'K4',
    ['Admin'],
  ),
  j(
    6,
    'create-service',
    'Create a service with the wizard',
    ['Provider member'],
    ['registry.services'],
    ['services.spec.ts'],
    'K4',
  ),
  j(
    7,
    'edit-service',
    'Edit a service and rename its slug',
    ['Provider member'],
    ['registry.services'],
    ['services.spec.ts'],
    'K4',
  ),
  j(
    8,
    'find-services',
    'Find services in the catalogue',
    ['User'],
    ['registry.services'],
    ['services.spec.ts'],
    'K4',
  ),
  j(
    9,
    'submit-kpi-values-form',
    'Submit a month of KPI values with the form',
    ['Provider member'],
    ['kpi.ingestion'],
    ['data-submission.spec.ts'],
    'K5a',
  ),
  j(
    10,
    'import-kpi-values-file',
    'Import KPI values from a CSV or XLSX file',
    ['Provider member'],
    ['kpi.ingestion'],
    ['data-submission.spec.ts'],
    'K5a',
  ),
  j(
    11,
    'submit-kpi-values-api',
    'Submit KPI values through the API',
    ['Provider member (script)'],
    ['kpi.ingestion', 'public-api'],
    [],
    'K5a',
  ),
  j(
    12,
    'read-dashboard-and-export',
    'Read the dashboard and export the numbers (CSV or XLSX)',
    ['User'],
    ['kpi.analytics'],
    ['dashboard-widgets.spec.ts'],
    'K5a',
  ),
  j(
    13,
    'evaluate-consortium-impact',
    "Evaluate a consortium's impact",
    ['Reviewer'],
    ['kpi.impact'],
    [],
    'K5b',
    ['Reviewer'],
  ),
  j(
    14,
    'apply-to-onboard',
    'Apply to onboard a service',
    ['Applicant (anonymous)'],
    ['onboarding', 'maturity'],
    [],
    'K6',
  ),
  j(
    15,
    'review-application',
    'Review and decide an application',
    ['Reviewer', 'Applicant'],
    ['onboarding', 'maturity'],
    [],
    'K6',
    ['Reviewer'],
  ),
  j(
    16,
    'publications-and-citations',
    'Add publications and check citations',
    ['Provider member'],
    ['bibliometrics'],
    [],
    'K6',
  ),
  j(
    17,
    'explore-service-network',
    'Explore the service network',
    ['User'],
    ['network-graph'],
    [],
    'K6',
  ),
  j(
    18,
    'announcements',
    'Read and dismiss announcements',
    ['User', 'Admin'],
    ['announcements'],
    [],
    'K6',
    ['Admin'],
  ),
];

export const journeyIds = journeys.map((x) => x.id) as [string, ...string[]];

export function getJourney(id: string): Journey | undefined {
  return journeys.find((x) => x.id === id);
}

/** Path of a journey page relative to src/content/docs, without extension. */
export function journeyPagePath(x: Journey): string {
  return `user/journeys/${x.id}-${x.slug}`;
}
