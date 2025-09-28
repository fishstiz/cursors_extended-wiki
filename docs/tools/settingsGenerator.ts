import JSZip from 'jszip'
import {
  FileProcessingError,
  FileProcessor,
  FileValidationError,
  FileValidator
} from '../types/FileProcessor'
import { isValidConfig } from '../types/Config'
import CursorSettings from '../types/CursorSettings'
import { encode } from '../utils/encoder'

export const validateConfigFile: FileValidator = async (file: File) => {
  return !file.name.toLowerCase().endsWith('.json')
    ? { ok: false, error: 'File must be a .json file' }
    : { ok: true }
}

export const processConfigFile: FileProcessor = async (file: File) => {
  const zip = new JSZip()
  const content = await file.text()
  const data = JSON.parse(content)

  if (!isValidConfig(data)) {
    throw new FileValidationError('Invalid config file')
  }

  if (!data.cursors || Object.keys(data.cursors).length === 0) {
    throw new FileValidationError('Config file must contain at least one cursor setting')
  }

  for (const [name, cursor] of Object.entries(data.cursors)) {
    const cursorSettings: CursorSettings = {
      enabled: cursor.enabled,
      scale: data.global?.scaleActive ? data.global.scale : cursor.scale,
      xhot: data.global?.xhotActive ? data.global.xhot : cursor.xhot,
      yhot: data.global?.yhotActive ? data.global.yhot : cursor.yhot
    }

    if (cursor.animated !== undefined) {
      cursorSettings.animated = cursor.animated
    }

    zip.file(`${name}.png.json`, encode(JSON.stringify({ cursor: cursorSettings }, null, 2)), {
      binary: true
    })
  }

  return await zip.generateAsync({ type: 'blob' })
}

export const generateFileName = (_fileName: string): string => {
  const now = new Date()

  const pad = (n: number) => n.toString().padStart(2, '0')

  const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-')
  const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('-')

  return `cursors_generated_${date}_${time}.zip`
}
