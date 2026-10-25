import { decodeBase64 } from '@/lib/tools/encode/base64';
import { decodeHex } from '@/lib/tools/encode/hex';
import type { CodecResult } from '@/lib/tools/encode/types';

/** How a key or secret typed as text is turned into bytes. */
export type TextEncoding = 'utf8' | 'hex' | 'base64';

const encoder = new TextEncoder();

export function textBytes(
  text: string,
  encoding: TextEncoding
): CodecResult<Uint8Array<ArrayBuffer>> {
  if (encoding === 'utf8') return { ok: true, value: encoder.encode(text) };
  const decoded = encoding === 'hex' ? decodeHex(text) : decodeBase64(text);
  return decoded.ok ? { ok: true, value: decoded.value.bytes } : decoded;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length));
}
