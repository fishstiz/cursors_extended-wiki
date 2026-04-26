import z from 'zod'

const Frame = z.object({
  index: z.number(),
  time: z.number()
})

type Frame = z.infer<typeof Frame>

export const Frames = z.union([z.number(), Frame]).array().nullish().optional()

export type Frames = z.infer<typeof Frames>

export const Animation = z.object({
  frametime: z.number().default(1),
  mode: z.string().optional(),
  frames: Frames
})

export type Animation = z.infer<typeof Animation>

export const CursorMetadata = Animation

export type CursorMetadata = z.infer<typeof CursorMetadata>
