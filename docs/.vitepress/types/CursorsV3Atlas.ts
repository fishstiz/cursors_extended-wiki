import CursorSettings from './CursorSettings'

export default interface CursorsV3Atlas {
  settings: Record<string, CursorSettings>
}

export function isValidCursorsV3Atlas(data: any): data is CursorsV3Atlas {
  return data && typeof data === 'object' && 'settings' in data && typeof data.settings === 'object'
}
