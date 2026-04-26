import JSZip from 'jszip'
import { CursorAtlas } from '@/schema/cursor-atlas-v3'
import { CursorMetadata as CursorMetadataV3 } from '@/schema/cursor-metadata-v3'
import { CursorMetadata as CursorMetadataV4 } from '@/schema/cursor-metadata-v4'
import { PackMeta } from '@/schema/pack-meta'
import { FileProcessor, FileValidator } from '@/utils/file-validator'
import { decode, encode } from '@/utils/encoder'
import type { Asset, AssetMap, AssetProvider, MergeStrategy } from '@/schema/asset'

type MapDirection = 'upgrade' | 'downgrade'
type JSZipAssetConverter = AssetProvider<JSZip.JSZipObject>
type CursorAssets = { cursors: AssetMap<JSZipAssetConverter>; meta: AssetMap<JSZipAssetConverter> }

const V3_NAMESPACE = 'assets/minecraft-cursor'
const V4_NAMESPACE = 'assets/cursors_extended'
const MIN_PACK_FORMAT_V3 = 15
const MIN_PACK_FORMAT = 67
const MAX_PACK_FORMAT = 200

const V3_ATLAS_PATH = `${V3_NAMESPACE}/atlases/cursors.json`

const MergeStrategies = {
  PREFER_FIRST: { merge: (a: Asset, _b) => a },
  JSON_SHALLOW: {
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
  V3_ATLAS: {
    merge: (a: Asset, b: Asset) => {
      try {
        const aData = JSON.parse(decode(a.data))
        const bData = JSON.parse(decode(b.data))
        return {
          ...a,
          data: encode(
            JSON.stringify({ settings: { ...aData.settings, ...bData.settings } }, null, 2)
          )
        }
      } catch {
        console.warn(`Settings merge failed, keeping first`)
        return a
      }
    }
  }
} as const satisfies Record<string, MergeStrategy<Asset>>

async function conformImageToV3(data: Uint8Array, animated: boolean): Promise<Uint8Array> {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' })
  const bitmap = await createImageBitmap(blob)

  const { width, height } = bitmap

  const dominantDimension = animated ? width : Math.max(width, height)
  let size = Math.ceil(dominantDimension / 8) * 8

  let drawW = width
  let drawH = height

  if (size > 128) {
    const scale = 128 / size
    drawW = Math.round(width * scale)
    drawH = Math.round(height * scale)
    size = Math.ceil((animated ? drawW : Math.max(drawW, drawH)) / 8) * 8
  }

  const canvasW = size
  const canvasH = animated ? Math.ceil(height / 8) * 8 : size

  if (canvasW === width && canvasH === height) {
    bitmap.close()
    return data
  }

  const canvas = new OffscreenCanvas(canvasW, canvasH)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, drawW, drawH)
  bitmap.close()

  const outBlob = await canvas.convertToBlob({ type: 'image/png' })
  return new Uint8Array(await outBlob.arrayBuffer())
}

const mapCursorImages = (oldPath: string, ...newPaths: string[]): AssetMap<JSZipAssetConverter> => {
  return {
    [oldPath]: {
      get: async (image) => {
        const data = await image.async('uint8array')
        return newPaths.map((path) => ({
          path,
          data,
          mergeStrategy: MergeStrategies.PREFER_FIRST
        }))
      }
    }
  }
}

const mapCursorMeta = (
  direction: MapDirection,
  names: string[],
  paths: string[]
): JSZipAssetConverter => {
  const schema = direction === 'upgrade' ? CursorMetadataV3 : CursorMetadataV4

  return async (metaJson: JSZip.JSZipObject) => {
    const assets: Asset[] = []

    try {
      const parsed = JSON.parse(await metaJson.async('string'))
      const result = schema.safeParse(parsed)

      if (result.success) {
        const animation =
          direction === 'upgrade'
            ? (result.data as CursorMetadataV3)
            : (result.data as CursorMetadataV4).animation

        if (animation) {
          const body = direction === 'upgrade' ? { animation } : animation

          for (const path of paths) {
            assets.push({
              path,
              data: encode(JSON.stringify(body, null, 2)),
              mergeStrategy: MergeStrategies.JSON_SHALLOW
            })
          }
        }

        if (direction === 'downgrade') {
          const data = result.data as CursorMetadataV4
          const body: CursorAtlas = {
            settings: names.reduce<CursorAtlas['settings']>((acc, name) => {
              acc[name] = { ...data.cursor }
              return acc
            }, {})
          }

          assets.push({
            path: V3_ATLAS_PATH,
            data: encode(JSON.stringify(body, null, 2)),
            mergeStrategy: MergeStrategies.V3_ATLAS
          })
        }
      } else {
        console.error('Failed to parse cursor meta JSON', metaJson.name, result.error)
      }
    } catch (e) {
      console.error('Failed to read cursor meta JSON:', e)
    }

    return assets
  }
}

const mapCursors = (direction: MapDirection) => {
  const previousDir =
    direction === 'upgrade'
      ? `${V3_NAMESPACE}/textures/cursors`
      : `${V4_NAMESPACE}/textures/gui/sprites/cursors`

  const newDir =
    direction === 'upgrade'
      ? `${V4_NAMESPACE}/textures/gui/sprites/cursors`
      : `${V3_NAMESPACE}/textures/cursors`

  return (cursorMap: Record<string, string[]>): CursorAssets => {
    const assets: CursorAssets = { cursors: {}, meta: {} }

    for (const [oldName, newNames] of Object.entries(cursorMap)) {
      const prevImagePath = `${previousDir}/${oldName}.png`
      const newImagePath = (newName: string) => `${newDir}/${newName}.png`
      const prevMetaExtension = direction === 'upgrade' ? '.mcmeta' : '.json'
      const newMetaExtension = direction === 'upgrade' ? '.json' : '.mcmeta'

      assets.cursors = Object.assign(
        assets.cursors,
        mapCursorImages(prevImagePath, ...newNames.map(newImagePath))
      )

      assets.meta = Object.assign(assets.meta, {
        [`${prevImagePath}${prevMetaExtension}`]: {
          get: mapCursorMeta(
            direction,
            newNames,
            newNames.map((name) => `${newImagePath(name)}${newMetaExtension}`)
          )
        }
      })
    }

    return assets
  }
}

const upgradeCursorMap: CursorAssets = mapCursors('upgrade')({
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

const downgradeCursorMap: CursorAssets = mapCursors('downgrade')({
  default: ['default'],
  pointing_hand: ['pointer'],
  pointer: ['pointer'],
  ibeam: ['text'],
  grabbing: ['grabbing'],
  shift: ['shift'],
  busy: ['busy'],
  not_allowed: ['not_allowed'],
  crosshair: ['crosshair'],
  resize_ns: ['resize_ns'],
  resize_ew: ['resize_ew'],
  resize_nesw: ['resize_nesw'],
  resize_nwse: ['resize_nwse']
})

const mapMcmeta = (direction: MapDirection = 'upgrade'): JSZipAssetConverter => {
  const minPackFormat = direction === 'downgrade' ? MIN_PACK_FORMAT_V3 : MIN_PACK_FORMAT

  return async (mcmetaJson: JSZip.JSZipObject) => {
    const assets: Asset[] = []

    try {
      const parsed = JSON.parse(decode(new Uint8Array(await mcmetaJson.async('arraybuffer'))))
      const result = PackMeta.safeParse(parsed)
      const data: PackMeta = result.success ? result.data : parsed

      if (result.success) {
        const supportedFormats = data.pack.supported_formats ?? []

        data.pack.pack_format =
          direction === 'upgrade'
            ? Math.max(minPackFormat, data.pack.pack_format || 0)
            : Math.min(minPackFormat, data.pack.pack_format)

        data.pack.min_format =
          direction === 'upgrade'
            ? Math.max(minPackFormat, data.pack.min_format || 0)
            : Math.min(
                data.pack.min_format || minPackFormat,
                data.pack.max_format || minPackFormat,
                data.pack.pack_format || minPackFormat,
                minPackFormat,
                ...supportedFormats
              )

        data.pack.max_format = Math.max(
          MAX_PACK_FORMAT,
          Math.max(
            data.pack.min_format || 0,
            data.pack.max_format || 0,
            data.pack.pack_format || 0,
            ...supportedFormats
          )
        )

        if (direction === 'downgrade') {
          data.pack.supported_formats = [
            Math.min(data.pack.min_format, minPackFormat),
            data.pack.max_format
          ]
        }

        if (direction === 'upgrade') {
          delete data.pack.supported_formats
        }
      } else {
        console.error('Failed to parse pack.mcmeta', mcmetaJson.name, result.error)
      }

      assets.push({
        path: 'pack.mcmeta',
        data: encode(JSON.stringify(data, null, 2)),
        mergeStrategy: MergeStrategies.JSON_SHALLOW
      })
    } catch (e) {
      console.error('Failed to read pack.mcmeta:', e)
    }

    return assets
  }
}

const mapV4CursorSettings: JSZipAssetConverter = async (cursorsJson: JSZip.JSZipObject) => {
  const assets: Asset[] = []
  try {
    const result = CursorAtlas.safeParse(JSON.parse(await cursorsJson.async('string')))
    if (!result.success) return assets

    for (const [key, settings] of Object.entries(result.data.settings)) {
      const provider = upgradeCursorMap.cursors[`${V3_NAMESPACE}/textures/cursors/${key}.png`]

      if (!provider) continue

      for (const cursorAsset of await provider?.get(cursorsJson)) {
        assets.push({
          path: `${cursorAsset.path}.json`,
          data: encode(JSON.stringify({ cursor: settings }, null, 2)),
          mergeStrategy: MergeStrategies.JSON_SHALLOW
        })
      }
    }
  } catch (e) {
    console.error('Failed to read cursor settings JSON:', e)
  }

  return assets
}

const upgradeAssetMap: AssetMap<JSZipAssetConverter> = {
  'pack.mcmeta': { get: mapMcmeta('upgrade') },
  ...upgradeCursorMap.cursors,
  ...upgradeCursorMap.meta,
  [V3_ATLAS_PATH]: { get: mapV4CursorSettings }
}

const downgradeAssetMap: AssetMap<JSZipAssetConverter> = {
  'pack.mcmeta': { get: mapMcmeta('downgrade') },
  ...downgradeCursorMap.cursors,
  ...downgradeCursorMap.meta
}

export const validateZip: FileValidator = async (file: File) => {
  return !file.name.toLowerCase().endsWith('.zip')
    ? { ok: false, error: 'File must be a .zip archive' }
    : { ok: true }
}

export const processZip = (direction: MapDirection = 'upgrade'): FileProcessor => {
  const assetMap = direction === 'upgrade' ? upgradeAssetMap : downgradeAssetMap

  return async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    const assetBuckets: Record<string, Asset[] | undefined> = {}

    const promises: Promise<void>[] = []

    // convert assets
    zip.forEach((relativePath, zipEntry) => {
      const assetProvider = assetMap[relativePath]
      if (!zipEntry || !assetProvider) return

      promises.push(
        assetProvider.get(zipEntry).then((assets) => {
          for (const asset of assets) {
            if (!assetBuckets[asset.path]) assetBuckets[asset.path] = []
            assetBuckets[asset.path]?.push(asset)
          }
        })
      )
    })

    await Promise.all(promises)
    promises.length = 0

    // retain unconverted assets
    zip.forEach((relativePath, zipEntry) => {
      if (assetBuckets[relativePath]?.length) return

      promises.push(
        zipEntry.async('uint8array').then((data) => {
          if (!assetBuckets[relativePath]) assetBuckets[relativePath] = []
          assetBuckets[relativePath]?.push({
            data,
            path: relativePath,
            mergeStrategy: MergeStrategies.PREFER_FIRST
          })
        })
      )
    })

    await Promise.all(promises)
    promises.length = 0

    // post processing
    if (direction === 'downgrade') {
      const newDir = `${V3_NAMESPACE}/textures/cursors`
      for (const [path, assets] of Object.entries(assetBuckets)) {
        if (!assets?.length) continue
        if (!path.startsWith(newDir) || !path.endsWith('.png')) continue

        const animated = !!assetBuckets[`${path}.mcmeta`]?.length

        assets.forEach((asset) => {
          if (asset.path.endsWith('.png')) {
            promises.push(
              conformImageToV3(asset.data, animated).then((data) => {
                asset.data = data
              })
            )
          }
        })
      }
    }

    await Promise.all(promises)

    const newZip = new JSZip()
    for (const [path, assets] of Object.entries(assetBuckets)) {
      if (!assets?.length) continue

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
}
