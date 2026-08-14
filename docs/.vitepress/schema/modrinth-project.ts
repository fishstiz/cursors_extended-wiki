import z from 'zod'
import { fi } from 'zod/locales'

export const User = z.looseObject({
  username: z.string(),
  name: z.string().nullish().optional()
})

export type User = z.infer<typeof User>

export const Member = z.looseObject({
  user: User,
  ordering: z
    .number()
    .nullish()
    .transform((val) => val ?? 0)
})

export type Member = z.infer<typeof Member>

export const ModrinthProject = z.looseObject({
  id: z.string(),
  team: z.string(),
  project_type: z.string(),
  downloads: z.number(),
  published: z.string().pipe(z.coerce.date()),
  updated: z.string().pipe(z.coerce.date()),
  followers: z.number(),
  title: z.string().default(''),
  description: z.string().default(''),
  body: z.string().default(''),
  game_versions: z.string().array().default([]),
  loaders: z.string().array().default([]),
  versions: z.string().array().default([]),
  categories: z.string().array().default([]),
  slug: z.string().nullish().optional(),
  icon_url: z.string().nullish().optional(),
  client_side: z.string().nullish().optional(),
  server_size: z.string().nullish().optional(),
  issues_url: z.string().nullish().optional(),
  source_url: z.string().nullish().optional(),
  wiki_url: z.string().nullish().optional()
})

export type ModrinthProject = z.infer<typeof ModrinthProject>

export const ModrinthProjectFile = z.looseObject({
  filename: z.string(),
  url: z.string(),
  primary: z.boolean()
})

export type ModrinthProjectFile = z.infer<typeof ModrinthProjectFile>

export const ModrinthProjectVersion = z.looseObject({
  name: z.string(),
  version_number: z.string(),
  game_versions: z.string().array(),
  date_published: z.string().pipe(z.coerce.date()),
  files: ModrinthProjectFile.array()
})

export type ModrinthProjectVersion = z.infer<typeof ModrinthProjectVersion>
