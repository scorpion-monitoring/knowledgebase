import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

// Relative to the working directory for the same reason as docsRoot in src/data/pages.ts.
// `KB_GENERATED_ROOT` lets tests point at a scratch folder.
export function generatedRoot(): string {
  return process.env.KB_GENERATED_ROOT ?? resolve(process.cwd(), 'src/data/generated');
}

/** Rows of a generated JSON table, or undefined when the file does not exist yet. */
export function readGenerated(
  file: string,
  root: string = generatedRoot(),
): Record<string, unknown>[] | undefined {
  if (basename(file) !== file || !file.endsWith('.json')) {
    throw new Error(
      `<GeneratedTable file="${file}">: must be a .json file name inside src/data/generated/.`,
    );
  }
  const path = join(root, file);
  if (!existsSync(path)) return undefined;
  const data: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${path}: expected a JSON array of objects.`);
  return data as Record<string, unknown>[];
}
