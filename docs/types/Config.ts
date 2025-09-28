import CursorSettings, { ICursorSettings } from './CursorSettings'

export interface GlobalSettings extends ICursorSettings {
  scaleActive?: boolean
  xhotActive?: boolean
  yhotActive?: boolean
}

export default interface Config {
  global?: GlobalSettings
  cursors?: Record<string, CursorSettings>
}

export function isValidConfig(data: any): data is Config {
  return (
    data &&
    typeof data === 'object' &&
    (!('global' in data) || typeof data.global === 'object') &&
    (!('cursors' in data) || typeof data.cursors === 'object')
  )
}
