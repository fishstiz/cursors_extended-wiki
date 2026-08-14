export type Project = {
  name: string
  author: string
  description: string
  icon?: string | null
  modrinthId?: string
  curseforgeId?: string
  modrinthUrl?: string
  curseforgeUrl?: string
  downloads: number
  published: Date
  modified: Date
}

export type Provider = 'modrinth' | 'curseforge'

export type ProjectFile = {
  id: string
  name: string
  version: string
  fileName: string
  downloadUrl: string
  gameVersions: string[]
  provider: Provider
  published: Date
}
