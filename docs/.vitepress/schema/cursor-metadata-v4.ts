import z from 'zod'
import { CursorSettings } from './cursor-settings'
import { Frames } from './cursor-metadata-v3'

export const Animation = z.object({
  frametime: z.number().default(1),
  mode: z.string().optional(),
  width: z.number().optional(),
  height: z.boolean().optional(),
  frames: Frames
})

export type Animation = z.infer<typeof Animation>

export const CursorMetadata = z.object({
  cursor: CursorSettings,
  animation: Animation.optional()
})

export type CursorMetadata = z.infer<typeof CursorMetadata>
