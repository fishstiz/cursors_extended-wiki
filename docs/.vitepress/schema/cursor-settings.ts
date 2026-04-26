import z from 'zod'

export const CursorProperties = z.object({
  scale: z.number().default(1),
  xhot: z.number().default(0),
  yhot: z.number().default(0)
})

export type CursorProperties = z.infer<typeof CursorProperties>

export const CursorSettings = CursorProperties.extend({
  enabled: z.boolean().optional(),
  animated: z.boolean().optional().nullish()
})

export type CursorSettings = z.infer<typeof CursorSettings>
