export type MergeStrategy<T> = { merge: (a: T, b: T) => T }

export default interface Asset {
  path: string
  data: Uint8Array
  mergeStrategy: MergeStrategy<Asset>
}

export type AssetMapper<T = any> = (t: T) => Promise<Asset[]>
export type DeferredAsset<M extends AssetMapper = AssetMapper<unknown>> = { get: M }
export type AssetMap<M extends AssetMapper = AssetMapper<unknown>> = Record<
  string,
  DeferredAsset<M>
>
