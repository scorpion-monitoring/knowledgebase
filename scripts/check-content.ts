import { fileURLToPath } from 'node:url';
import { runContentChecks } from './lib/check-content';

const root = fileURLToPath(new URL('..', import.meta.url));
const report = runContentChecks(root);

for (const n of report.notices) console.log(`notice: ${n}`);
console.log(`source comments (inventory for K3): ${report.sources.length}`);
for (const s of report.sources) console.log(`  ${s.file}: ${s.source}`);

if (report.errors.length > 0) {
  for (const e of report.errors) console.error(`error: ${e.file}: ${e.message}`);
  console.error(`\n${report.errors.length} content check error(s).`);
  process.exit(1);
}
console.log('content checks passed');
