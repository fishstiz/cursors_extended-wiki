import z from "zod"

export const PackMeta = z.looseObject({
  pack: z.looseObject({
    pack_format: z.number().default(0),
    min_format: z.number().default(0),
    max_format: z.number().default(0),
    description: z.string().optional().nullish(),
    supported_formats: z.array(z.number()).optional().nullish()
  })
})

export type PackMeta = z.infer<typeof PackMeta>
