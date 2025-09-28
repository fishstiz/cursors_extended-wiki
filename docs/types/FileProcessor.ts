export type FileValidationResult = { ok: boolean; error?: string }
export type FileValidator = (file: File) => Promise<FileValidationResult>
export type FileProcessor = (file: File) => Promise<Blob | MediaSource>

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
