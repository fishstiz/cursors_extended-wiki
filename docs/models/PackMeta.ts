export default interface PackMeta {
  pack: {
    pack_format?: number
    min_format: number
    max_format: number
    description?: string
    supported_formats?: string[]
  }
}
