import { defineLoader } from 'vitepress'
import path from 'path'
import fs from 'fs'
import z from 'zod'

const packSchema = z.object({
  name: z.string(),
  modrinthId: z.string().optional(),
  curseforgeId: z.string().optional(),
  staticData: z
    .object({
      iconUrl: z.string(),
      author: z.string(),
      description: z.string(),
      datePublished: z.string(),
      dateModified: z.string()
    })
    .optional(),
  externalLinks: z
    .object({
      url: z.string(),
      name: z.string()
    })
    .array()
    .default([])
})

export type Pack = z.infer<typeof packSchema>

const dataSchema = z.object({
  packs: packSchema.array().default([])
})

export type Data = z.infer<typeof dataSchema>

declare const data: Data
export { data }

export default defineLoader({
  load(): Data {
    return dataSchema.parse(
      JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../showcase.json'), 'utf-8'))
    )
  }
})
