import z from 'zod'
import { CursorSettings } from './cursor-settings'

export const CursorAtlas = z.looseObject({
  settings: z.record(z.string(), CursorSettings)
})

export type CursorAtlas = z.infer<typeof CursorAtlas>
