// Terminology catalogue from docs/implementation.md §6.1. No definitions here: those are the pages (K1).
// `preferred` is the spelling Vale enforces; `avoid` lists forbidden synonyms (see scripts/gen-vale.ts).

export interface Term {
  id: string;
  group: TermGroup;
  preferred: string;
  /** Forbidden synonyms Vale flags, mapped to this term's preferred spelling. */
  avoid?: readonly string[];
}

export const termGroups = [
  'Monitoring and evaluation',
  'Indicators',
  'Indicator frameworks',
  'Data',
  'Targets',
  'Analysis',
  'Services and organisations',
  'Maturity',
  'Bibliometrics',
  'Openness',
  'Access',
] as const;

export type TermGroup = (typeof termGroups)[number];

const t = (group: TermGroup, id: string, preferred: string, avoid?: string[]): Term => ({
  id,
  group,
  preferred,
  avoid,
});

export const terms: readonly Term[] = [
  t('Monitoring and evaluation', 'monitoring', 'monitoring'),
  t('Monitoring and evaluation', 'evaluation', 'evaluation'),
  t('Monitoring and evaluation', 'impact-assessment', 'impact assessment'),
  t('Monitoring and evaluation', 'reporting', 'reporting'),
  t('Monitoring and evaluation', 'reporting-period', 'reporting period'),
  t('Monitoring and evaluation', 'results-chain', 'results chain'),
  t('Indicators', 'indicator', 'indicator'),
  t('Indicators', 'key-performance-indicator', 'key performance indicator (KPI)'),
  t('Indicators', 'metric', 'metric'),
  t('Indicators', 'measure', 'measure'),
  t('Indicators', 'headline-indicator', 'headline indicator'),
  t('Indicators', 'leading-and-lagging-indicators', 'leading and lagging indicators'),
  t(
    'Indicators',
    'quantitative-and-qualitative-indicators',
    'quantitative and qualitative indicators',
  ),
  t('Indicator frameworks', 'indicator-framework', 'indicator framework', ['KPI-set', 'KPI-sets']),
  t('Indicator frameworks', 'necessity-level', 'necessity level'),
  t('Indicator frameworks', 'thematic-category', 'thematic category'),
  t('Data', 'measurement', 'measurement'),
  t('Data', 'observation', 'observation'),
  t('Data', 'value-type', 'value type'),
  t('Data', 'unit-of-measurement', 'unit of measurement'),
  t('Data', 'time-series', 'time series'),
  t('Data', 'period-normalisation', 'period normalisation', ['period normalization']),
  t('Data', 'data-provenance', 'data provenance'),
  t('Targets', 'baseline', 'baseline'),
  t('Targets', 'target', 'target'),
  t('Targets', 'threshold', 'threshold'),
  t('Analysis', 'aggregation', 'aggregation'),
  t('Analysis', 'cumulative-value', 'cumulative value'),
  t('Analysis', 'percentage-change', 'percentage change'),
  t('Analysis', 'trend', 'trend'),
  t('Analysis', 'volatility', 'volatility'),
  t('Analysis', 'mean-absolute-percentage-deviation', 'mean absolute percentage deviation'),
  t('Analysis', 'mean-absolute-percentage-error', 'mean absolute percentage error (MAPE)'),
  t('Analysis', 'sparkline', 'sparkline'),
  t('Services and organisations', 'research-infrastructure', 'research infrastructure'),
  t('Services and organisations', 'service', 'service'),
  t('Services and organisations', 'service-provider', 'service provider'),
  t('Services and organisations', 'consortium', 'consortium'),
  t('Services and organisations', 'service-catalogue', 'service catalogue', ['service catalog']),
  t('Services and organisations', 'service-registry', 'service registry'),
  t('Services and organisations', 'lifecycle-stage', 'lifecycle stage'),
  t('Maturity', 'maturity-model', 'maturity model'),
  t('Maturity', 'dimension', 'dimension'),
  t('Maturity', 'criterion', 'criterion'),
  t('Maturity', 'maturity-level', 'maturity level'),
  t('Maturity', 'self-assessment', 'self-assessment'),
  t('Bibliometrics', 'publication', 'publication'),
  t('Bibliometrics', 'persistent-identifier', 'persistent identifier'),
  t('Bibliometrics', 'doi', 'DOI'),
  t('Bibliometrics', 'citation', 'citation'),
  t('Bibliometrics', 'citation-count', 'citation count'),
  t('Bibliometrics', 'bibliometric-indicator', 'bibliometric indicator'),
  t('Openness', 'open-source-licence', 'open-source licence', ['open-source license']),
  t('Openness', 'spdx-licence-identifier', 'SPDX licence identifier', ['SPDX license identifier']),
  t('Openness', 'osi-approval', 'OSI approval'),
  t('Access', 'authentication', 'authentication'),
  t('Access', 'authorisation', 'authorisation', ['authorization']),
  t('Access', 'role', 'role'),
  t('Access', 'permission', 'permission'),
  t('Access', 'single-sign-on', 'single sign-on (OIDC)'),
  t('Access', 'personal-access-token', 'personal access token'),
];

export const termIds = terms.map((x) => x.id);

export function getTerm(id: string): Term | undefined {
  return terms.find((x) => x.id === id);
}

/** Other spelling and wording the Scorpion style rejects, independent of a single term. */
export const forbiddenWording: ReadonlyArray<{ avoid: string; use: string }> = [
  { avoid: 'Organization', use: 'Organisation' },
  { avoid: 'Organizations', use: 'Organisations' },
  { avoid: 'organization', use: 'organisation' },
  { avoid: 'organizations', use: 'organisations' },
  { avoid: 'behavior', use: 'behaviour' },
  { avoid: 'a log in', use: 'a sign-in' },
  { avoid: 'the log in', use: 'the sign-in' },
];

export const bannedWords = ['simply', 'just', 'easy', 'obviously'] as const;

/** Names that must not appear under terminology/ (feeds the Terminology Vale style). */
export const terminologyRoleNames = ['Admin', 'Reviewer'] as const;

export function termPagePath(id: string): string {
  return `terminology/${id}`;
}
