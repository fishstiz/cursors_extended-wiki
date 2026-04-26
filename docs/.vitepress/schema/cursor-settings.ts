import z from 'zod'

export const CursorMetadata = z.object({
  scale: z.number().optional(),
  xhot: z.number().optional(),
  yhot: z.number().optional()
})

export type CursorMetadata = z.infer<typeof CursorMetadata>

export const CursorSettings = CursorMetadata.extend({
  enabled: z.boolean().optional(),
  animated: z.boolean().optional().nullish()
})

export type CursorSettings = z.infer<typeof CursorSettings>
