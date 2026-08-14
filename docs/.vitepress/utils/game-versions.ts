const V4_MIN_INCLUSIVE_VERSION = '1.21.9'

export function isSnapshotVersion(gameVersion: string): boolean {
  return /[a-zA-Z]/g.test(gameVersion)
}

export function compareVersions(a: string, b: string): number {
  if (isSnapshotVersion(a) || isSnapshotVersion(b)) {
    throw new Error('Cannot compare snapshot versions')
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function isV4(gameVersion: string): boolean {
  return compareVersions(gameVersion, V4_MIN_INCLUSIVE_VERSION) <= 0
}
