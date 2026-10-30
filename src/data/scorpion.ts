import scorpion from '../../scorpion.json';

export interface ScorpionRelease {
  documents: string;
}

const release = scorpion as ScorpionRelease;

if (!/^v\d+\.\d+\.\d+$/.test(release.documents)) {
  throw new Error(
    `scorpion.json: "documents" must be a release tag like v0.13.0, got "${release.documents}"`,
  );
}

export const documentedRelease: string = release.documents;

export function parseVersion(tag: string): [number, number, number] {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!m) throw new Error(`Not a version tag (vX.Y.Z): ${tag}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Negative when a < b, zero when equal, positive when a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i]! - pb[i]!;
  return 0;
}
