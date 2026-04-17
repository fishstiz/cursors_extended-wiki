export type Project = {
  name: string
  author: string
  description: string
  icon?: string | null
  modrinthUrl?: string
  curseforgeUrl?: string
  downloads: number
  published: Date
  modified: Date
}
