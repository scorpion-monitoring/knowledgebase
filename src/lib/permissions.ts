import { readGenerated } from './generated';

/**
 * K3 hook: once `pnpm sync` writes `permissions.json` (rows with an `id`), permission ids are checked
 * against it. Until then only the shape is checked.
 */
export function knownPermissionIds(root?: string): Set<string> | undefined {
  const rows = readGenerated('permissions.json', root);
  return rows ? new Set(rows.map((r) => String(r.id))) : undefined;
}

export function assertKnownPermission(
  id: string,
  known: Set<string> | undefined = knownPermissionIds(),
): void {
  if (!/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/i.test(id)) {
    throw new Error(`<Permission id="${id}">: not a permission id (expected dotted segments).`);
  }
  if (known && !known.has(id)) {
    throw new Error(`<Permission id="${id}">: not in the generated permissions. Check the id.`);
  }
}
