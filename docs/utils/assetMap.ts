import JSZip from 'jszip'
import { SettingsMap } from '../models/CursorSettings'
import PackMeta from '../models/PackMeta'

export type Asset = { path: string; data: Uint8Array; mergeStrategy: MergeStrategy }

type MergeStrategy =
  | { kind: 'JSON'; apply: (a: Asset, b: Asset) => Asset }
  | { kind: 'PREFER_FIRST'; apply: (a: Asset, b: Asset) => Asset }
type AssetTransform = (zipObject: JSZip.JSZipObject) => Promise<Asset[]>
type MappedAsset = { map: AssetTransform }
type AssetMap = Record<string, MappedAsset>
type CursorAssets = { cursors: AssetMap; meta: AssetMap }

const MergeStrategies = {
  JSON: {
    kind: 'JSON',
    apply: (a, b) => {
      try {
        const merged = Object.assign({}, JSON.parse(decode(a.data)), JSON.parse(decode(b.data)))
        return { ...a, data: encode(JSON.stringify(merged, null, 2)) }
      } catch {
        console.warn(`JSON merge failed for ${a.path}, keeping first`)
        return a
      }
    }
  },
  PREFER_FIRST: { kind: 'PREFER_FIRST', apply: (a, _b) => a }
} as const satisfies Record<string, MergeStrategy>

const previousNamespace = 'assets/minecraft-cursor'
const newNamespace = 'assets/cursors_extended'

const cursorAssets: CursorAssets = mapCursors({
  default: ['default'],
  pointer: ['pointing_hand'],
  text: ['ibeam'],
  grabbing: ['grabbing', 'resize_all'],
  shift: ['shift'],
  busy: ['busy'],
  not_allowed: ['not_allowed'],
  crosshair: ['crosshair'],
  resize_ns: ['resize_ns'],
  resize_ew: ['resize_ew'],
  resize_nesw: ['resize_nesw'],
  resize_nwse: ['resize_nwse']
})

function encode(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function decode(UInt8Array: Uint8Array): string {
  return new TextDecoder('utf-8').decode(UInt8Array)
}

function mapImages(oldPath: string, ...newPaths: string[]): AssetMap {
  return {
    [oldPath]: {
      map: async (image) => {
        const data = await image.async('uint8array')
        return newPaths.map((path) => ({ path, data, mergeStrategy: MergeStrategies.PREFER_FIRST }))
      }
    }
  }
}

function mapCursorMeta(paths: string[]): AssetTransform {
  return async (metaJson: JSZip.JSZipObject) => {
    const assets: Asset[] = []

    try {
      const animation = JSON.parse(await metaJson.async('string'))
      const data = encode(JSON.stringify({ animation }, null, 2))

      for (const path of paths) {
        assets.push({ path: path, data, mergeStrategy: MergeStrategies.JSON })
      }
    } catch (e) {
      console.error('Failed to read cursor meta JSON:', e)
    }

    return assets
  }
}

function mapCursors(map: Record<string, string[]>): CursorAssets {
  const previousDir = `${previousNamespace}/textures/cursors`
  const newDir = `${newNamespace}/textures/gui/sprites/cursors`
  const cursorAssets: CursorAssets = { cursors: {}, meta: {} }

  for (const [oldName, newNames] of Object.entries(map)) {
    const oldPath = `${previousDir}/${oldName}.png`
    const newPath = (newName: string) => `${newDir}/${newName}.png`

    Object.assign(cursorAssets.cursors, mapImages(oldPath, ...newNames.map(newPath)))
    Object.assign(cursorAssets.meta, {
      [`${oldPath}.mcmeta`]: { map: mapCursorMeta(newNames.map((name) => `${newPath(name)}.json`)) }
    })
  }

  return cursorAssets
}

const mapCursorSettings: AssetTransform = async (cursorsJson: JSZip.JSZipObject) => {
  const assets: Asset[] = []

  try {
    const data: SettingsMap = JSON.parse(await cursorsJson.async('string'))

    for (const [key, settings] of Object.entries(data.settings)) {
      const mappedCursor = cursorAssets.cursors[`${previousNamespace}/textures/cursors/${key}.png`]
      if (!mappedCursor) continue

      for (const cursorAsset of await mappedCursor?.map(cursorsJson)) {
        assets.push({
          path: `${cursorAsset.path}.json`,
          data: encode(JSON.stringify({ cursor: settings }, null, 2)),
          mergeStrategy: MergeStrategies.JSON
        })
      }
    }
  } catch (e) {
    console.error('Failed to read cursor settings JSON:', e)
  }

  return assets
}

const mapMcmeta: AssetTransform = async (mcmetaJson: JSZip.JSZipObject) => {
  const assets: Asset[] = []

  try {
    const data: PackMeta = JSON.parse(decode(new Uint8Array(await mcmetaJson.async('arraybuffer'))))

    if (data.pack) {
      data.pack.pack_format = Math.max(67, data.pack.pack_format || 0)
      data.pack.min_format = Math.max(67, data.pack.min_format || 0)
      data.pack.max_format = Math.max(200, data.pack.min_format || 0)
      delete data.pack.supported_formats
    }

    assets.push({
      path: 'pack.mcmeta',
      data: encode(JSON.stringify(data, null, 2)),
      mergeStrategy: MergeStrategies.JSON
    })
  } catch (e) {
    console.error('Failed to read pack.mcmeta:', e)
  }

  return assets
}

export const assetMap: AssetMap = {
  'pack.mcmeta': { map: mapMcmeta },
  ...mapImages('pack.png', 'pack.png'),
  ...cursorAssets.cursors,
  ...cursorAssets.meta,
  [`${previousNamespace}/atlases/cursors.json`]: { map: mapCursorSettings }
}
