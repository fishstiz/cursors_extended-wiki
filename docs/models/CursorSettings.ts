export default interface CursorSettings {
  enabled?: boolean
  xhot?: number
  yhot?: number
  scale?: number
  animated?: boolean
}

export type SettingsMap = { settings: Record<string, CursorSettings> }
