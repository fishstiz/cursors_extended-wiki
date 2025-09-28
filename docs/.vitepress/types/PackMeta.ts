export default interface PackMeta {
  pack: {
    pack_format?: number
    min_format: number
    max_format: number
    description?: string
    supported_formats?: string[]
  }
}

export function isValidPackMeta(data: any): data is PackMeta {
  return data && typeof data === 'object' && 'pack' in data && typeof data.pack === 'object'
}
