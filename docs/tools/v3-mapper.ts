import JSZip from 'jszip'
import { CursorAtlasV3 } from '@/schema/cursor-atlas-v3'
import { PackMeta } from '@/schema/pack-meta'
import { FileProcessor, FileValidator } from '@/utils/file-validator'
import { decode, encode } from '@/utils/encoder'
import type { Asset, AssetMap, AssetProvider, AssetHolder, MergeStrategy } from '@/schema/asset'
import z from 'zod'

type JSZipAssetMap = AssetProvider<JSZip.JSZipObject>
type CursorAssets = { cursors: AssetMap; meta: AssetMap }

const PREVIOUS_NAMESPACE = 'assets/minecraft-cursor'
const NEW_NAMESPACE = 'assets/cursors_extended'
const MIN_PACK_FORMAT = 67
const MAX_PACK_FORMAT = 200

const MergeStrategies = {
  JSON: {
    merge: (a: Asset, b: Asset) => {
      try {
        const merged = Object.assign({}, JSON.parse(decode(a.data)), JSON.parse(decode(b.data)))
        return { ...a, data: encode(JSON.stringify(merged, null, 2)) }
      } catch {
        console.warn(`JSON merge failed for ${a.path}, keeping first`)
        return a
      }
    }
  },
  PREFER_FIRST: { merge: (a: Asset, _b) => a }
} as const satisfies Record<string, MergeStrategy<Asset>>

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

function mapImages(oldPath: string, ...newPaths: string[]): AssetMap<JSZipAssetMap> {
  return {
    [oldPath]: {
      get: async (image) => {
        const data = await image.async('uint8array')
        return newPaths.map((path) => ({ path, data, mergeStrategy: MergeStrategies.PREFER_FIRST }))
      }
    }
  }
}

function mapCursorMeta(paths: string[]): JSZipAssetMap {
  return async (metaJson: JSZip.JSZipObject) => {
    const assets: Asset[] = []

    try {
      const animation = JSON.parse(await metaJson.async('string'))
      if (animation && typeof animation === 'object' && !Array.isArray(animation)) {
        const data = encode(JSON.stringify({ animation }, null, 2))
        for (const path of paths) {
          assets.push({ path, data, mergeStrategy: MergeStrategies.JSON })
        }
      }
    } catch (e) {
      console.error('Failed to read cursor meta JSON:', e)
    }

    return assets
  }
}

function mapCursors(map: Record<string, string[]>): CursorAssets {
  const previousDir = `${PREVIOUS_NAMESPACE}/textures/cursors`
  const newDir = `${NEW_NAMESPACE}/textures/gui/sprites/cursors`
  const cursorAssets: CursorAssets = { cursors: {}, meta: {} }

  for (const [oldName, newNames] of Object.entries(map)) {
    const oldPath = `${previousDir}/${oldName}.png`
    const newPath = (newName: string) => `${newDir}/${newName}.png`

    Object.assign(cursorAssets.cursors, mapImages(oldPath, ...newNames.map(newPath)))
    Object.assign(cursorAssets.meta, {
      [`${oldPath}.mcmeta`]: {
        get: mapCursorMeta(newNames.map((name) => `${newPath(name)}.json`))
      } satisfies AssetHolder<JSZipAssetMap>
    })
  }

  return cursorAssets
}

const mapCursorSettings: JSZipAssetMap = async (cursorsJson: JSZip.JSZipObject) => {
  const assets: Asset[] = []

  try {
    const result = CursorAtlasV3.safeParse(JSON.parse(await cursorsJson.async('string')))
    if (!result.success) return assets

    for (const [key, settings] of Object.entries(result.data.settings)) {
      const provider = cursorAssets.cursors[`${PREVIOUS_NAMESPACE}/textures/cursors/${key}.png`]

      if (!provider) continue

      for (const cursorAsset of await provider?.get(cursorsJson)) {
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

const mapMcmeta: JSZipAssetMap = async (mcmetaJson: JSZip.JSZipObject) => {
  const assets: Asset[] = []

  try {
    const parsed = JSON.parse(decode(new Uint8Array(await mcmetaJson.async('arraybuffer'))))
    const result = PackMeta.safeParse(parsed)
    const data: PackMeta = result.success ? result.data : parsed

    if (result.success) {
      data.pack.pack_format = Math.max(MIN_PACK_FORMAT, data.pack.pack_format || 0)
      data.pack.min_format = Math.max(MIN_PACK_FORMAT, data.pack.min_format || 0)
      data.pack.max_format = Math.max(
        MAX_PACK_FORMAT,
        Math.max(data.pack.min_format || 0, data.pack.max_format || 0)
      )
      delete data.pack.supported_formats
    } else {
      console.error('Failed to parse pack.mcmeta', mcmetaJson.name, result.error)
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

const assetMap: AssetMap<JSZipAssetMap> = {
  'pack.mcmeta': { get: mapMcmeta },
  ...cursorAssets.cursors,
  ...cursorAssets.meta,
  [`${PREVIOUS_NAMESPACE}/atlases/cursors.json`]: { get: mapCursorSettings }
}

export const validateZip: FileValidator = async (file: File) => {
  return !file.name.toLowerCase().endsWith('.zip')
    ? { ok: false, error: 'File must be a .zip archive' }
    : { ok: true }
}

export const processZip: FileProcessor = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const assetBuckets: Record<string, Asset[]> = {}

  const promises: Promise<void>[] = []

  zip.forEach((relativePath, zipEntry) => {
    const assetProvider = assetMap[relativePath]
    if (!zipEntry || !assetProvider) return

    promises.push(
      assetProvider.get(zipEntry).then((assets) => {
        for (const asset of assets) {
          if (!assetBuckets[asset.path]) assetBuckets[asset.path] = []
          assetBuckets[asset.path].push(asset)
        }
      })
    )
  })

  await Promise.all(promises)
  promises.length = 0

  zip.forEach((relativePath, zipEntry) => {
    if (assetBuckets[relativePath]) return

    promises.push(
      zipEntry.async('uint8array').then((data) => {
        if (!assetBuckets[relativePath]) assetBuckets[relativePath] = []

        assetBuckets[relativePath].push({
          data,
          path: relativePath,
          mergeStrategy: MergeStrategies.PREFER_FIRST
        })
      })
    )
  })

  await Promise.all(promises)

  const newZip = new JSZip()
  for (const [path, assets] of Object.entries(assetBuckets)) {
    if (assets.length === 0) continue

    let merged = assets[0]
    for (let i = 1; i < assets.length; i++) {
      const asset = assets[i]
      if (asset && merged.mergeStrategy) {
        merged = merged.mergeStrategy.merge(merged, asset)
      }
    }

    newZip.file(path, merged.data, { binary: true, createFolders: false })
  }

  return await newZip.generateAsync({ type: 'blob' })
}
