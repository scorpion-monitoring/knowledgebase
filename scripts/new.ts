import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scaffold, usage, UsageError } from './lib/new';

const root = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);

if (argv.length === 0 || argv.includes('--help')) {
  console.log(usage);
  process.exit(argv.length === 0 ? 1 : 0);
}

try {
  const result = scaffold(root, argv);
  if (result.navigation) {
    spawnSync('pnpm', ['exec', 'prettier', '--write', 'src/data/navigation.ts'], {
      cwd: root,
      stdio: 'ignore',
    });
  }
  console.log(`created ${relative(root, result.file)}`);
  console.log(
    'The page is a draft. Fill it in, then set draft: false and add since and verifiedAgainst.',
  );
} catch (e) {
  if (e instanceof UsageError) {
    console.error(`error: ${e.message}`);
    process.exit(1);
  }
  throw e;
}
