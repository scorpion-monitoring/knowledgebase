// Page templates from CLAUDE.md ("Templates"). Keep the headings: the content checks and the
// journey step comparison rely on them.

import type { Journey } from '../../src/data/journeys';
import type { ScorpionModule } from '../../src/data/modules';
import type { Term } from '../../src/data/terms';

const q = (s: string) => `"${s.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
const list = (xs: readonly string[]) => `[${xs.join(', ')}]`;

export const placeholder = (milestone: string) =>
  `This page is filled in KB milestone ${milestone}.`;

export function journeyPage(j: Journey, title: string): string {
  return `---
title: ${q(title)}
description: ${q(`Step by step: ${title.charAt(0).toLowerCase()}${title.slice(1)}.`)}
pageType: tutorial
audience: user
modules: ${list(j.modules)}
roles: ${list(j.roles)}
journey: ${j.id}
draft: true
---

import { Steps } from '@astrojs/starlight/components';
import JourneyMeta from '@components/JourneyMeta.astro';

## Overview

${placeholder(j.milestone)}

## Before you start

<JourneyMeta id="${j.id}" />

## Steps

<Steps>

1. Placeholder step.

</Steps>

## Result

## If something goes wrong

## Related
`;
}

export function termPage(t: Term, title: string): string {
  return `---
title: ${q(title)}
description: ${q(`Definition of ${t.preferred}.`)}
pageType: explanation
audience: all
term: ${q(t.preferred)}
short: ${q('Placeholder definition, written in KB milestone K1.')}
aliases: []
related: []
draft: true
---

## Definition

${placeholder('K1')}

## Explanation

## Example

## Not to be confused with

## References
`;
}

export function modulePage(m: ScorpionModule): string {
  const since = m.since ? `since: ${m.since}\n` : '';
  return `---
title: ${q(m.name)}
description: ${q(`What the ${m.name} module does, where it is included and where to find its documentation.`)}
pageType: explanation
audience: all
modules: [${m.id}]
${since}draft: true
---

import ProfileMatrix from '@components/ProfileMatrix.astro';

## What it does

${placeholder(m.milestone)}

## Included in profiles

<ProfileMatrix module="${m.id}" />

## Depends on

${m.dependsOn.length > 0 ? m.dependsOn.map((d) => `- \`${d}\``).join('\n') : 'No other optional module.'}

## For users

## For administrators

## For developers
`;
}

export function adminTaskPage(title: string, modules: readonly string[] = []): string {
  return `---
title: ${q(title)}
description: ${q(`Administrator task: ${title.charAt(0).toLowerCase()}${title.slice(1)}.`)}
pageType: how-to
audience: admin
modules: ${list(modules)}
roles: [Admin]
draft: true
---

## Goal

${placeholder('K3')}

## Before you start

## Steps

## Check that it worked

## Undo or roll back

## Related settings
`;
}

export function developerPage(title: string, modules: readonly string[] = []): string {
  return `---
title: ${q(title)}
description: ${q(`Developer guide: ${title.charAt(0).toLowerCase()}${title.slice(1)}.`)}
pageType: explanation
audience: developer
modules: ${list(modules)}
draft: true
---

## Goal or concept

${placeholder('K2')}

## How it works

## Example

## Rules and pitfalls

## Reference links
`;
}
