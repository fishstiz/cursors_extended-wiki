import z from 'zod'
import { CursorSettings, CursorMetadata } from './cursor-settings'

export const GlobalSettings = CursorMetadata.extend({
  scaleActive: z.boolean().optional(),
  xhotActive: z.boolean().optional(),
  yhotActive: z.boolean().optional()
})

export type GlobalSettings = z.infer<typeof GlobalSettings>

export const Config = z.object({
  global: GlobalSettings.optional(),
  cursors: z.record(z.string(), CursorSettings).optional()
})

export type Config = z.infer<typeof Config>
