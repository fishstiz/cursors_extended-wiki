import z from 'zod'

export const Author = z.looseObject({
  id: z.coerce.string(),
  name: z.string(),
  url: z.string()
})

export type Author = z.infer<typeof Author>

export const CurseforgeProject = z.looseObject({
  name: z.string(),
  summary: z.string(),
  links: z.object({ websiteUrl: z.string() }),
  logo: z.object({ url: z.string() }),
  authors: Author.array(),
  downloadCount: z.number(),
  dateReleased: z.string().pipe(z.coerce.date()),
  dateModified: z.string().pipe(z.coerce.date())
})

export type CurseforgeProject = z.infer<typeof CurseforgeProject>
