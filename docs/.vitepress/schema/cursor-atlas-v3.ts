import z from 'zod'
import { CursorSettings } from './cursor-settings'

export const CursorAtlasV3 = z.looseObject({
  settings: z.record(z.string(), CursorSettings)
})

export type CursorAtlasV3 = z.infer<typeof CursorAtlasV3>
