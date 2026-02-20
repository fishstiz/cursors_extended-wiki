export type FileValidationResult = { ok: boolean; error?: string }
export type FileValidator = (file: File) => Promise<FileValidationResult>
export type FileProcessor = (file: File) => Promise<Blob | MediaSource>

const SUCCESS: Readonly<FileValidationResult> = Object.freeze({ ok: true })
const FAILURE: Readonly<FileValidationResult> = Object.freeze({ ok: false })

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileValidationError'
  }
}

export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileProcessingError'
  }
}

export function success(): Readonly<FileValidationResult> {
  return SUCCESS
}

export function failure(error?: string): Readonly<FileValidationResult> {
  return error ? { ok: false, error } : FAILURE
}
