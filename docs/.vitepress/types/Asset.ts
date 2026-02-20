export type MergeStrategy<T> = { merge: (a: T, b: T) => T }

export default interface Asset {
  path: string
  data: Uint8Array
  mergeStrategy?: MergeStrategy<Asset>
}

export type AssetProvider<T> = (t: T) => Promise<Asset[]>
export type AssetHolder<P extends AssetProvider<any> = AssetProvider<unknown>> = { get: P }
export type AssetMap<P extends AssetProvider<any> = AssetProvider<unknown>> = Record<
  Asset['path'],
  AssetHolder<P>
>
