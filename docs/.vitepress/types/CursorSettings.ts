export interface ICursorSettings {
  scale?: number
  xhot?: number
  yhot?: number
}

export default interface CursorSettings extends ICursorSettings {
  enabled?: boolean
  animated?: boolean
}
