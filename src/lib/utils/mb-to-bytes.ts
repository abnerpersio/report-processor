export function mbToBytes(mb: number) {
  return mb * 1024 * 1024;
}

export function bytesToMb(bytes: number) {
  return bytes / 1024 / 1024;
}

export function getByteLength(content: string) {
  return bytesToMb(Buffer.byteLength(content, "utf-8"));
}
