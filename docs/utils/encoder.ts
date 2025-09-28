export function encode(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function decode(UInt8Array: Uint8Array): string {
  return new TextDecoder('utf-8').decode(UInt8Array)
}
